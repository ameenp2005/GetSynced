import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

type Note = {
  id: number;
  content: string;
};

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
};

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("https://getsynced-production.up.railway.app/tasks")
      .then((response) => response.json())
      .then((data) => setTasks(data));

    fetch("https://getsynced-production.up.railway.app/tasks")
      .then((response) => response.json())
      .then((data) => setNotes(data));

    fetch("https://getsynced-production.up.railway.app/tasks")
      .then((response) => response.json())
      .then((data) => setEvents(data));
  }, []);

  const today = new Date().toLocaleDateString();

  const todayString = new Date().toISOString().split("T")[0];

  const todaysEvents = events.filter((event) => event.date === todayString);
  const upcomingTasks = tasks.filter((task) => !task.completed).slice(0, 3);

  const latestNote = notes.length > 0 ? notes[notes.length - 1] : null;

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <h2>👋 Welcome back!</h2>

      <p>
        Today is{" "}
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📅 Today's Date</h3>
          <p>{today}</p>
        </div>

        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/tasks")}
        >
          <h3>✅ Tasks</h3>
          <p>{tasks.length}</p>
        </div>

        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/notes")}
        >
          <h3>📝 Notes</h3>
          <p>{notes.length}</p>
        </div>

        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/calendar")}
        >
          <h3>📆 Calendar Events</h3>
          <p>{events.length}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>

        <button onClick={() => navigate("/tasks")}>➕ New Task</button>

        <button onClick={() => navigate("/notes")}>📝 New Note</button>

        <button onClick={() => navigate("/calendar")}>📅 Open Calendar</button>
      </div>
      <div className="dashboard-card">
        <h3>📅 Today's Events</h3>

        {todaysEvents.length === 0 ? (
          <p>No events today.</p>
        ) : (
          <ul>
            {todaysEvents.map((event) => (
              <li key={event.id}>
                {event.time} - {event.title}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="dashboard-card">
        <h3>✅ Upcoming Tasks</h3>

        {upcomingTasks.length === 0 ? (
          <p>All caught up! 🎉</p>
        ) : (
          <ul>
            {upcomingTasks.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="dashboard-card">
        <h3>📝 Latest Note</h3>

        {latestNote ? <p>{latestNote.content}</p> : <p>No notes yet.</p>}
      </div>
    </div>
  );
}

export default Dashboard;
