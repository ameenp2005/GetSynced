import { useEffect, useState } from "react";

type Note = {
  id: number;
  content: string;
};

function Notes() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch("https://getsynced-production.up.railway.app/notes")
      .then((response) => response.json())
      .then((data) => setNotes(data));
  }, []);

  async function addNote() {
    if (note.trim() === "") return;

    const response = await fetch("https://getsynced-production.up.railway.app/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: note,
      }),
    });

    const newNote = await response.json();

    setNotes([...notes, newNote]);
    setNote("");
  }

  async function deleteNote(indexToDelete: number) {
    const confirmed = confirm(`Delete this note?`);

    if (!confirmed) return;

    const noteToDelete = notes[indexToDelete];

    await fetch(`https://getsynced-production.up.railway.app/notes/${noteToDelete.id}`, {
      method: "DELETE",
    });

    setNotes(notes.filter((_, index) => index !== indexToDelete));
  }

  return (
    <div className="notes-page">
      <h1>Notes</h1>

      <input
        type="text"
        placeholder="Write a note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addNote();
          }
        }}
      />

      <button onClick={addNote} disabled={note.trim() === ""}>
        Add Note
      </button>

      {notes.length === 0 ? (
        <p>No notes yet. ✍️</p>
      ) : (
        <ul>
          {notes.map((item, index) => (
            <li key={item.id}>
              {item.content}

              <button onClick={() => deleteNote(index)}>❌</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notes;
