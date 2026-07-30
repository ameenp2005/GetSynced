function Settings() {
  const clearData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all tasks, notes, and calendar events?",
    );

    if (!confirmed) return;

    localStorage.clear();

    alert("All data has been deleted.");

    window.location.reload();
  };

  const storageUsed = (
    new Blob(Object.values(localStorage)).size / 1024
  ).toFixed(2);

  return (
    <div
      style={{
        padding: "30px",
        color: "white",
        maxWidth: "700px",
      }}
    >
      <h1>⚙️ Settings</h1>

      <div
        style={{
          marginTop: "25px",
          border: "1px solid gray",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <h2>Appearance</h2>

        <p>
          <strong>Theme:</strong> 🌙 Dark Mode
        </p>
      </div>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid gray",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <h2>Storage</h2>

        <p>
          Local Storage Used: <strong>{storageUsed} KB</strong>
        </p>

        <button
          onClick={clearData}
          style={{
            marginTop: "15px",
            padding: "10px 18px",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          🗑️ Clear All Data
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid gray",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <h2>About</h2>

        <p>
          <strong>Application:</strong> GetSynced
        </p>

        <p>
          <strong>Version:</strong> 1.0.0
        </p>

        <p>Built with React + TypeScript.</p>
      </div>
    </div>
  );
}

export default Settings;
