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
  const eventColors = ["blue", "green", "orange", "purple"];
  const colorMap = {
    blue: { bg: "var(--accent-soft)", color: "var(--accent)" },
    green: { bg: "var(--green-soft)", color: "#15803d" },
    orange: { bg: "var(--orange-soft)", color: "#b45309" },
    purple: { bg: "var(--purple-soft)", color: "#7e22ce" },
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

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        background:
          "linear-gradient(135deg, #fbf8ff 0%, #f7f3ff 60%, #f1eaff 100%)",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}></div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          style={{
            background: "var(--white)",
            border: "1.5px solid var(--border)",
            padding: "7px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            color: "var(--slate)",
          }}
        >
          ‹
        </button>
        <h2
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: "24px",
            flex: 1,
          }}
        >
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          style={{
            background: "var(--white)",
            border: "1.5px solid var(--border)",
            padding: "7px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            color: "var(--slate)",
          }}
        >
          ›
        </button>
        <button
          onClick={goToToday}
          style={{
            background: "var(--white)",
            border: "1.5px solid var(--border)",
            padding: "7px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            color: "var(--slate)",
          }}
        >
          Today
        </button>
        <div style={{ flex: 1 }}></div>
        <button
          onClick={() => navigate("/new-event")}
          style={{
            padding: "9px 18px",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* Day Labels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                padding: "12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--muted)",
                letterSpacing: ".05em",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {/* empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                minHeight: "110px",
                borderRight: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                padding: "8px",
                opacity: 0.4,
              }}
            ></div>
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
                  minHeight: "110px",
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  padding: "8px",
                  ...((i + firstDay + 1) % 7 === 0
                    ? { borderRight: "none" }
                    : {}),
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    width: "26px",
                    height: "26px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isToday ? "var(--accent)" : "none",
                    color: isToday ? "white" : "var(--ink)",
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
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        marginBottom: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        fontWeight: 500,
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

      {/* Event Modal */}
      {selectedEvent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,46,.45)",
            backdropFilter: "blur(4px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--white)",
              borderRadius: "18px",
              padding: "32px",
              width: "480px",
              maxWidth: "90vw",
              boxShadow: "0 24px 60px rgba(0,0,0,.18)",
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
                  fontFamily: "DM Serif Display, serif",
                  fontSize: "22px",
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
                  fontSize: "22px",
                  color: "var(--muted)",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "var(--muted)",
                  marginBottom: "4px",
                }}
              >
                Time
              </div>
              <div style={{ fontSize: "14px", color: "var(--ink2)" }}>
                {new Date(selectedEvent.start_datetime).toLocaleDateString()} ·{" "}
                {new Date(selectedEvent.start_datetime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(selectedEvent.end_datetime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "var(--muted)",
                  marginBottom: "4px",
                }}
              >
                Description
              </div>
              <div style={{ fontSize: "14px", color: "var(--ink2)" }}>
                {selectedEvent.description || "No description"}
              </div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "var(--muted)",
                  marginBottom: "4px",
                }}
              >
                Visibility
              </div>
              <div style={{ fontSize: "14px", color: "var(--ink2)" }}>
                {selectedEvent.visibility}
              </div>
            </div>
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
                  padding: "9px 20px",
                  background: "var(--white)",
                  color: "var(--accent)",
                  border: "1.5px solid var(--accent)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => deleteEvent(selectedEvent.event_id)}
                style={{
                  padding: "9px 20px",
                  background: "var(--red)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
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
