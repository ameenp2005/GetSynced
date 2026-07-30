import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside>
      <ul>
        <li>
          <Link to="/">🏠 Dashboard</Link>
        </li>

        <li>
          <Link to="/tasks">✅ Tasks</Link>
        </li>

        <li>
          <Link to="/calendar">📅 Calendar</Link>
        </li>

        <li>
          <Link to="/notes">📝 Notes</Link>
        </li>

        <li>
          <Link to="/ai">🤖 AI Assistant</Link>
        </li>

        <li>
          <Link to="/settings">⚙️ Settings</Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
