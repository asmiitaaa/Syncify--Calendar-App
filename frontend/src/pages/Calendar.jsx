import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function Calendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      showToast("Error loading events");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      showToast("Event deleted successfully");
      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting event");
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // dark theme color map for event pills
  const eventColors = ["blue", "green", "orange", "purple"];
  const colorMap = {
    blue: { bg: "var(--accent-soft)", color: "var(--accent-text)" },
    green: { bg: "var(--green-soft)", color: "var(--green)" },
    orange: { bg: "var(--orange-soft)", color: "var(--orange)" },
    purple: { bg: "var(--purple-soft)", color: "var(--purple)" },
  };

  function changeMonth(dir) {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  }

  function goToToday() {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  }

  const today = new Date();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  function getEventsForDay(day) {
    return events.filter((e) => {
      const d = new Date(e.start_datetime);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });
  }

  const btnStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    color: "var(--muted)",
    fontFamily: "var(--font-sans)",
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        background: "var(--bg)",
        padding: "28px 24px",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          maxWidth: "1200px",
          margin: "0 auto 20px",
        }}
      >
        <button onClick={() => changeMonth(-1)} style={btnStyle}>
          ‹
        </button>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--ink2)",
            flex: 1,
          }}
        >
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button onClick={() => changeMonth(1)} style={btnStyle}>
          ›
        </button>
        <button onClick={goToToday} style={btnStyle}>
          Today
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate("/new-event")}
          style={{
            padding: "8px 18px",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          + Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {/* Day Labels */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              background: "var(--surface2)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  padding: "12px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--dim)",
                  letterSpacing: ".08em",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}
          >
            {/* empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  minHeight: "100px",
                  borderRight: "1px solid var(--border2)",
                  borderBottom: "1px solid var(--border2)",
                  padding: "8px",
                  opacity: 0.2,
                }}
              />
            ))}

            {/* day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  style={{
                    minHeight: "100px",
                    borderRight: "1px solid var(--border2)",
                    borderBottom: "1px solid var(--border2)",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      marginBottom: "5px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isToday ? "var(--accent)" : "none",
                      color: isToday ? "white" : "var(--muted)",
                    }}
                  >
                    {day}
                  </div>
                  {dayEvents.slice(0, 3).map((e, idx) => {
                    const c = eventColors[idx % eventColors.length];
                    return (
                      <div
                        key={e.event_id}
                        onClick={() => setSelectedEvent(e)}
                        style={{
                          fontSize: "10px",
                          padding: "2px 5px",
                          borderRadius: "3px",
                          marginBottom: "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          fontWeight: 400,
                          background: colorMap[c].bg,
                          color: colorMap[c].color,
                        }}
                      >
                        {e.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            backdropFilter: "blur(4px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "28px",
              width: "460px",
              maxWidth: "90vw",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "20px",
                  color: "var(--ink)",
                }}
              >
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "var(--faint)",
                }}
              >
                ×
              </button>
            </div>

            {[
              {
                label: "Time",
                value: `${new Date(selectedEvent.start_datetime).toLocaleDateString()} · ${new Date(selectedEvent.start_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(selectedEvent.end_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              },
              {
                label: "Description",
                value: selectedEvent.description || "No description",
              },
              { label: "Visibility", value: selectedEvent.visibility },
            ].map((row) => (
              <div key={row.label} style={{ marginBottom: "14px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "var(--dim)",
                    marginBottom: "4px",
                  }}
                >
                  {row.label}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--slate)",
                    fontWeight: 300,
                  }}
                >
                  {row.value}
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  padding: "8px 18px",
                  background: "transparent",
                  color: "var(--accent-text)",
                  border: "1.5px solid var(--accent)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Close
              </button>
              <button
                onClick={() => deleteEvent(selectedEvent.event_id)}
                style={{
                  padding: "8px 18px",
                  background: "var(--red)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
