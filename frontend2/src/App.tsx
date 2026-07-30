import { Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./pages/Navbar";
import Sidebar from "./pages/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Notes from "./pages/Notes";
import AI from "./pages/AI";
import Settings from "./pages/Settings";

function App() {
  return (
    <>
      <Navbar title="GetSynced" />

      <div className="layout">
        <Sidebar />

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
