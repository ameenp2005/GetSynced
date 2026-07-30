import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from fastapi import HTTPException

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    text,
)
from sqlalchemy.orm import (
    sessionmaker,
    declarative_base,
    Session,
)

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)


class EventCreate(BaseModel):
    title: str
    date: str
    time: str


class EventUpdate(BaseModel):
    title: str


class NoteCreate(BaseModel):
    content: str


class TaskUpdate(BaseModel):
    completed: bool


class TaskTitleUpdate(BaseModel):
    title: str


class Question(BaseModel):
    prompt: str


class AIAction(BaseModel):
    action: str

    title: str | None = None
    content: str | None = None

    date: str | None = None
    time: str | None = None

    task_id: int | None = None
    event_id: int | None = None

    note_id: int | None = None


class EmptyRequest(BaseModel):
    pass


class TaskCreate(BaseModel):
    title: str


Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"answer": "Backend is working!"}


@app.get("/test-db")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database();"))
        database_name = result.scalar()

    return {"database": database_name}


@app.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = Task(title=task.title, completed=False)

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    events = db.query(Event).all()
    return tasks


@app.post("/ask")
def ask_ai(question: Question):
    response = client.responses.create(
        model="gpt-5.5",
        input=question.prompt,
    )

    return {"answer": response.output_text.replace("**", "")}


@app.post("/agent")
def ai_agent(question: Question, db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    events = db.query(Event).all()
    notes = db.query(Note).all()

    task_list = "\n".join(
        f"{task.title} - {'Completed' if task.completed else 'Not Completed'}"
        for task in tasks
    )

    event_list = "\n".join(f"{event.id}: {event.title}" for event in events)

    note_list = "\n".join(f"{note.id}: {note.content}" for note in notes)

    response = client.responses.parse(
        model="gpt-5.5",
        input=[
            {
                "role": "system",
                "content": f"""
You are an AI assistant.

Current tasks:

{task_list}

Current events:

{event_list}

Current notes:

{note_list}
If the user asks to summarize their notes, summarize the current notes listed above.

Do not ask the user to paste their notes.

If the user asks to create a task:

action = create_task

title = the task title

If the user asks to create a note:

action = create_note

content = the note content

If the user asks to create an event:

action = create_event

title = the event title

date = YYYY-MM-DD

time = HH:MM

If the user asks to complete a task:

action = complete_task

task_id = the task id

If the user asks to delete a task:

action = delete_task

task_id = the task id

If the user asks to rename a task:

action = rename_task

task_id = the task id

title = the new title

If the user asks to delete an event:

action = delete_event

event_id = the event id

If the user asks to rename an event:

action = rename_event

event_id = the event id

title = the new title

If the user asks to delete a note:

action = delete_note

note_id = the note id

Respond using plain text only.
Do not use Markdown formatting.

Otherwise:

action = chat
""",
            },
            {
                "role": "user",
                "content": question.prompt,
            },
        ],
        text_format=AIAction,
    )

    result = response.output_parsed
    print("ACTION:", result.action)
    print(result)

    if result.action == "create_task":
        new_task = Task(
            title=result.title,
            completed=False,
        )

        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        return {
            "answer": f"✅ Task '{new_task.title}' created!",
            "task": new_task,
        }

    elif result.action == "create_note":
        new_note = Note(
            content=result.content,
        )

        db.add(new_note)
        db.commit()
        db.refresh(new_note)

        return {
            "answer": "✅ Note created!",
            "note": new_note,
        }

    elif result.action == "create_event":
        new_event = Event(
            title=result.title,
            date=result.date,
            time=result.time,
        )

        db.add(new_event)
        db.commit()
        db.refresh(new_event)

        return {
            "answer": f"📅 Event '{new_event.title}' created!",
            "event": new_event,
        }

    elif result.action == "complete_task":
        task = db.query(Task).filter(Task.id == result.task_id).first()

        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        task.completed = True

        db.commit()
        db.refresh(task)

        return {
            "answer": f"✅ Completed '{task.title}'!",
            "task": task,
        }

    elif result.action == "delete_task":
        task = db.query(Task).filter(Task.id == result.task_id).first()

        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        db.delete(task)
        db.commit()

        return {"answer": "🗑️ Task deleted!"}

    elif result.action == "rename_task":
        task = db.query(Task).filter(Task.id == result.task_id).first()

        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        task.title = result.title

        db.commit()
        db.refresh(task)

        return {
            "answer": f"✏️ Task renamed to '{task.title}'!",
            "task": task,
        }

    elif result.action == "delete_event":
        event = db.query(Event).filter(Event.id == result.event_id).first()

        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")

        db.delete(event)
        db.commit()

        return {"answer": "🗑️ Event deleted!"}
    elif result.action == "rename_event":
        event = db.query(Event).filter(Event.id == result.event_id).first()

        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")

        event.title = result.title

        db.commit()
        db.refresh(event)

        return {
            "answer": f"✏️ Event renamed to '{event.title}'!",
            "event": event,
        }

    elif result.action == "delete_note":
        note = db.query(Note).filter(Note.id == result.note_id).first()

        if note is None:
            raise HTTPException(status_code=404, detail="Note not found")

        db.delete(note)
        db.commit()

        return {"answer": "🗑️ Note deleted!"}

    elif result.action == "chat":
        prompt = f"""
        Current tasks:

        {task_list}

        Current events:

        {event_list}

        Current notes:

        {note_list}

        User question:
        {question.prompt}

        Answer using the information above.
        """

        response = client.responses.create(
            model="gpt-5.5",
            input=prompt,
        )

        return {"answer": response.output_text.replace("**", "")}
    else:
        return {"answer": "I wasn't sure how to handle that request."}


@app.post("/plan-day")
def plan_day(request: EmptyRequest, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.completed == False).all()
    events = db.query(Event).all()

    task_list = "\n".join(f"- {task.title}" for task in tasks)

    event_list = "\n".join(
        f"- {event.date} {event.time}: {event.title}" for event in events
    )

    prompt = f"""
You are a productivity assistant.

Here are my unfinished tasks:

{task_list}

Here are my calendar events:

{event_list}

Create a realistic schedule for today.
Prioritize important work.
Include breaks if appropriate.
"""

    response = client.responses.create(
        model="gpt-5.5",
        input=prompt,
    )

    return {"answer": response.output_text.replace("**", "")}


@app.post("/prioritize-tasks")
def prioritize_tasks(request: EmptyRequest, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.completed == False).all()

    task_list = "\n".join(f"- {task.title}" for task in tasks)

    prompt = f"""
You are an expert productivity coach.

Here are my unfinished tasks:

{task_list}

Rank these tasks from highest to lowest priority.

For each task:
- Explain why it should be done in that order.
- Give a short recommendation.
"""

    response = client.responses.create(
        model="gpt-5.5",
        input=prompt,
    )

    return {"answer": response.output_text.replace("**", "")}


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"answer": "Task deleted"}


@app.patch("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    existing_task = db.query(Task).filter(Task.id == task_id).first()

    if existing_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    existing_task.completed = task.completed

    db.commit()
    db.refresh(existing_task)

    return existing_task


@app.patch("/tasks/{task_id}/title")
def update_task_title(
    task_id: int, task: TaskTitleUpdate, db: Session = Depends(get_db)
):
    existing_task = db.query(Task).filter(Task.id == task_id).first()

    if existing_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    existing_task.title = task.title

    db.commit()
    db.refresh(existing_task)

    return existing_task


@app.get("/notes")
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(Note).all()
    return notes


@app.post("/notes")
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    new_note = Note(content=note.content)

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()

    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    return {"answer": "Note deleted"}


@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()


@app.post("/events")
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    new_event = Event(
        title=event.title,
        date=event.date,
        time=event.time,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()

    return {"answer": "Event deleted"}


@app.patch("/events/{event_id}")
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    existing_event = db.query(Event).filter(Event.id == event_id).first()

    if existing_event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    existing_event.title = event.title

    db.commit()
    db.refresh(existing_event)

    return existing_event


@app.post("/summarize-notes")
def summarize_notes(request: EmptyRequest, db: Session = Depends(get_db)):
    notes = db.query(Note).all()

    note_list = "\n".join(f"- {note.content}" for note in notes)

    prompt = f"""
You are an expert at summarizing notes.

Here are my notes:

{note_list}

Summarize these notes.

Do not add new ideas or recommendations.
Do not infer information that is not written.
Only organize the existing notes into concise bullet points.

Respond in plain text only.

Respond in plain text only.
"""

    response = client.responses.create(
        model="gpt-5.5",
        input=prompt,
    )

    return {"answer": response.output_text.replace("**", "")}
