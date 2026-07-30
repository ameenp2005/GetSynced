import { useState } from "react";

function AI() {
  const [question, setQuestion] = useState("");
  type Message = {
    role: "user" | "assistant";
    text: string;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (question.trim() === "") return;

    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: question,
      },
    ]);

    try {
      const response = await fetch("https://getsynced-production.up.railway.app/plan-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: question,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer ?? "Done!",
        },
      ]);

      setQuestion("");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Could not connect to the backend.",
        },
      ]);
    }

    setLoading(false);
  };

  const handlePlanDay = async () => {
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: "Plan my day.",
      },
    ]);

    try {
      const response = await fetch("https://getsynced-production.up.railway.app/plan-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Could not connect to the backend.",
        },
      ]);
    }

    setLoading(false);
  };

  const handlePrioritizeTasks = async () => {
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: "Prioritize my tasks.",
      },
    ]);

    try {
      const response = await fetch("https://getsynced-production.up.railway.app/plan-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Could not connect to the backend.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleSummarizeNotes = async () => {
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: "Summarize my notes.",
      },
    ]);

    try {
      const response = await fetch("https://getsynced-production.up.railway.app/plan-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Could not connect to the backend.",
        },
      ]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    setQuestion("");
    setMessages([]);
    setLoading(false);
  };

  return (
    <div className="ai-container">
      <h1>🤖 AI Assistant</h1>

      <p>Ask AI anything about your tasks, notes, or productivity.</p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
          }
        }}
        placeholder="Type your question..."
        rows={6}
        style={{
          width: "100%",
          maxWidth: "700px",
          padding: "12px",
          fontSize: "16px",
          marginTop: "10px",
          borderRadius: "10px",
        }}
      />

      <br />
      <br />
      <div className="ai-buttons">
        <button
          onClick={handlePlanDay}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          ✨ Plan My Day
        </button>
        <button
          onClick={handleSummarizeNotes}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          📝 Summarize Notes
        </button>

        <button
          onClick={handlePrioritizeTasks}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          ✅ Prioritize Tasks
        </button>
        <button
          onClick={handleAsk}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Ask AI
        </button>

        <button
          onClick={clearChat}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Clear Chat
        </button>
      </div>
      <div className="ai-chat">
        <h2>Conversation</h2>

        {messages.length === 0 ? (
          <p>Start chatting with your AI assistant.</p>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.role}`}>
              <div className="chat-bubble">
                <div className="chat-name">
                  {message.role === "user" ? "👤 You" : "🤖 AI"}
                </div>

                {message.text}
              </div>
            </div>
          ))
        )}

        {loading && <p>🤖 Thinking...</p>}
      </div>
    </div>
  );
}

export default AI;
