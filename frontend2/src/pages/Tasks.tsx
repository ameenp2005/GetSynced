import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

function Tasks() {
  const [task, setTask] = useState("");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    fetch("https://getsynced-production.up.railway.app/tasks")
      .then((response) => response.json())
      .then((data) => setTasks(data));
  }, []);

  async function addTask() {
    if (task.trim() === "") return;

    const response = await fetch("https://getsynced-production.up.railway.app/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: task,
      }),
    });

    const newTask = await response.json();

    setTasks([...tasks, newTask]);

    setTask("");
  }

  async function deleteTask(indexToDelete: number) {
    const confirmed = confirm(
      `Are you sure you want to delete "${tasks[indexToDelete].title}"?`,
    );

    if (!confirmed) return;

    const taskToDelete = tasks[indexToDelete];

    await fetch(`https://getsynced-production.up.railway.app/tasks/${taskToDelete.id}`, {
      method: "DELETE",
    });

    setTasks(tasks.filter((_, index) => index !== indexToDelete));
  }

  async function toggleComplete(indexToToggle: number) {
    const task = tasks[indexToToggle];

    const response = await fetch(`https://getsynced-production.up.railway.app/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !task.completed,
      }),
    });

    const updatedTask = await response.json();

    const updatedTasks = [...tasks];
    updatedTasks[indexToToggle] = updatedTask;

    setTasks(updatedTasks);
  }

  function startEditing(index: number) {
    setEditingIndex(index);
    setEditingText(tasks[index].title);
  }

  async function saveEdit() {
    if (editingIndex === null) return;

    const task = tasks[editingIndex];

    const response = await fetch(
      `https://getsynced-production.up.railway.app/tasks/${task.id}/title`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingText,
        }),
      },
    );

    const updatedTask = await response.json();

    const updatedTasks = [...tasks];
    updatedTasks[editingIndex] = updatedTask;

    setTasks(updatedTasks);

    setEditingIndex(null);
    setEditingText("");
  }
  const filteredTasks = tasks
    .map((task, index) => ({
      task,
      index,
    }))
    .filter(({ task }) =>
      task.title.toLowerCase().includes(search.toLowerCase()),
    );

  const completedTasks = tasks.filter((task) => task.completed).length;
  const remainingTasks = tasks.length - completedTasks;
  const totalTasks = tasks.length;

  return (
    <div className="tasks-page">
      <h1 className="tasks-title">Tasks</h1>

      <p className="tasks-stats">
        {totalTasks} tasks • {completedTasks} completed • {remainingTasks}{" "}
        remaining
      </p>

      <div className="task-controls">
        <div className="task-input-row">
          <input
            type="text"
            placeholder="Enter a task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
          />

          <button onClick={addTask} disabled={task.trim() === ""}>
            Add
          </button>
        </div>

        <div className="search-row">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p>
          {search
            ? "No matching tasks found. 🔍"
            : "No tasks yet. Add your first task! 📝"}
        </p>
      ) : (
        <ul>
          {filteredTasks.map(({ task: item, index }) => (
            <li key={index} className="task-card">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleComplete(index)}
              />

              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveEdit();
                      }
                    }}
                  />

                  <button onClick={saveEdit}>💾</button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      textDecoration: item.completed ? "line-through" : "none",
                      marginLeft: "8px",
                      marginRight: "8px",
                    }}
                  >
                    {item.title}
                  </span>

                  <button onClick={() => startEditing(index)}>✏️</button>

                  <button onClick={() => deleteTask(index)}>❌</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tasks;
