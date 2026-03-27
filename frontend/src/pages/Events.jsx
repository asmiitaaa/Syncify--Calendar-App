import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function Events() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [events, setEvents] = useState([]);
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
      loadEvents();
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting event");
    }
  }

  async function respondInvite(eventId, status) {
    try {
      await API.put(`/participants/${eventId}`, { status });
      showToast(`Invitation ${status}`);
      loadEvents();
    } catch (err) {
      showToast("Error updating status");
    }
  }

  const badge = (text, color) => {
    const colors = {
      blue: { background: "var(--accent-soft)", color: "var(--accent)" },
      green: { background: "var(--green-soft)", color: "#16a34a" },
      orange: { background: "var(--orange-soft)", color: "#d97706" },
      gray: { background: "var(--surface)", color: "var(--slate)" },
      purple: { background: "var(--purple-soft)", color: "#9333ea" },
    };
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 9px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          ...colors[color],
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "28px",
              marginBottom: "4px",
            }}
          >
            My Events
          </div>
          <div style={{ color: "var(--slate)", fontSize: "14px" }}>
            All events you've created or been invited to
          </div>
        </div>
        <button
          onClick={() => navigate("/new-event")}
          style={{
            padding: "10px 20px",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New Event
        </button>
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "Event",
                "Date & Time",
                "Visibility",
                "Recurrence",
                "Role",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    background: "var(--surface)",
                    padding: "11px 16px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--muted)",
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--muted)",
                  }}
                >
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--muted)",
                  }}
                >
                  No events yet. Create your first event!
                </td>
              </tr>
            ) : (
              events.map((e) => {
                const start = new Date(e.start_datetime);
                const end = new Date(e.end_datetime);
                const isCreator = e.creator_id === user?.user_id;
                return (
                  <tr
                    key={e.event_id}
                    style={{ borderBottom: "1px solid var(--surface)" }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 500, fontSize: "14px" }}>
                        {e.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        {e.description || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "14px" }}>
                      {start.toLocaleDateString()}
                      <br />
                      <span style={{ color: "var(--muted)", fontSize: "12px" }}>
                        {start.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {end.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {badge(
                        e.visibility,
                        e.visibility === "shared" ? "blue" : "gray",
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {badge(
                        e.is_recurring ? e.recurrence_type : "None",
                        e.is_recurring ? "purple" : "gray",
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {badge(
                        isCreator ? "Creator" : "Participant",
                        isCreator ? "green" : "orange",
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {badge("Active", "green")}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {isCreator ? (
                          <button
                            onClick={() => deleteEvent(e.event_id)}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "15px",
                            }}
                          >
                            🗑️
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                respondInvite(e.event_id, "accepted")
                              }
                              style={{
                                padding: "5px 10px",
                                background: "var(--white)",
                                color: "var(--accent)",
                                border: "1.5px solid var(--accent)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                respondInvite(e.event_id, "declined")
                              }
                              style={{
                                padding: "5px 10px",
                                background: "var(--white)",
                                color: "var(--red)",
                                border: "1.5px solid var(--red)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
