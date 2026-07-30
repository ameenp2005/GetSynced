import { useEffect, useState } from "react";

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;

  day: number;
  month: number;
  year: number;
};

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [eventText, setEventText] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events")
      .then((response) => response.json())
      .then((data) => {
        const convertedEvents = data.map((event: any) => {
          const [year, month, day] = event.date.split("-").map(Number);

          return {
            ...event,
            day,
            month: month - 1,
            year,
          };
        });

        setEvents(convertedEvents);
      });
  }, []);

  function nextMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

    setSelectedDay(null);
    setEventText("");
  }

  function previousMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );

    setSelectedDay(null);
    setEventText("");
  }

  function goToToday() {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDay(today.getDate());
    setEventText("");
  }

  async function addEvent() {
    if (selectedDay === null) return;
    if (eventText.trim() === "") return;

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDay).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    const response = await fetch("http://127.0.0.1:8000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: eventText,
        date: formattedDate,
        time: "00:00",
      }),
    });

    const savedEvent = await response.json();

    const [savedYear, savedMonth, savedDay] = savedEvent.date
      .split("-")
      .map(Number);

    setEvents([
      ...events,
      {
        ...savedEvent,
        day: savedDay,
        month: savedMonth - 1,
        year: savedYear,
      },
    ]);

    setEventText("");
    setSelectedDay(null);
  }

  async function deleteEvent(idToDelete: number) {
    const confirmed = confirm("Delete this event?");

    if (!confirmed) return;

    await fetch(`http://127.0.0.1:8000/events/${idToDelete}`, {
      method: "DELETE",
    });

    setEvents(events.filter((event) => event.id !== idToDelete));
  }
  async function editEvent(idToEdit: number) {
    const eventToEdit = events.find((event) => event.id === idToEdit);

    if (!eventToEdit) return;

    const newTitle = prompt("Edit event:", eventToEdit.title);

    if (newTitle === null) return;

    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === "") return;

    const response = await fetch(`http://127.0.0.1:8000/events/${idToEdit}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: trimmedTitle,
      }),
    });

    const updatedEvent = await response.json();

    setEvents(
      events.map((event) =>
        event.id === idToEdit
          ? {
              ...event,
              title: updatedEvent.title,
            }
          : event,
      ),
    );
  }
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const emptyDays = Array.from(
    { length: firstDayOfMonth },
    (_, index) => index,
  );

  const today = new Date();

  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={previousMonth}>←</button>

        <button onClick={goToToday}>📅 Today</button>

        <h1>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h1>

        <button onClick={nextMonth}>→</button>
      </div>
      <h2 className="selected-date">
        {selectedDay
          ? `Selected: ${currentDate.toLocaleString("default", {
              month: "long",
            })} ${selectedDay}, ${currentDate.getFullYear()}`
          : "Select a day"}
      </h2>

      <div className="event-input">
        <input
          type="text"
          placeholder={selectedDay ? "Add an event..." : "Select a day first"}
          disabled={selectedDay === null}
          value={eventText}
          onChange={(e) => setEventText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addEvent();
            }
          }}
        />

        <button onClick={addEvent} disabled={selectedDay === null}>
          Add Event
        </button>
      </div>

      <div className="days-header">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="empty-day"></div>
        ))}

        {days.map((day) => {
          const dayEvents = events
            .filter(
              (event) =>
                event.day === day &&
                event.month === currentDate.getMonth() &&
                event.year === currentDate.getFullYear(),
            )
            .sort((a, b) => a.title.localeCompare(b.title));

          return (
            <div
              key={day}
              className={`calendar-day
                ${selectedDay === day ? "selected" : ""}
                ${isCurrentMonth && day === today.getDate() ? "today" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="day-number">{day}</div>
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="calendar-event"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="event-title">{event.title}</span>
                  <div className="event-buttons">
                    <button
                      className="edit-btn"
                      title="Edit Event"
                      onClick={(e) => {
                        e.stopPropagation();
                        editEvent(event.id);
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-btn"
                      title="Delete Event"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
