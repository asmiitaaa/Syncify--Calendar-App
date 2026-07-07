import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [statsRes, eventsRes, notifsRes] = await Promise.all([
        API.get("/dashboard/stats"),
        API.get("/events"),
        API.get("/notifications"),
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      setNotifications(notifsRes.data);
    } catch (err) {
      showToast("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // removed shared events card — now only 3 stat cards
  const statCards = [
    {
      icon: "🗒",
      label: "Total Events",
      value: stats?.total_events ?? "—",
      bg: "var(--accent-soft)",
    },
    {
      icon: "⌛︎",
      label: "Pending Invites",
      value: stats?.pending_invites ?? "—",
      bg: "var(--red-soft)",
    },
    {
      icon: "ᦠ",
      label: "Recurring Events",
      value: stats?.recurring_events ?? "—",
      bg: "var(--purple-soft)",
    },
  ];

  // all notifications use ⓘ with accent color
  const dotColors = { shared: "var(--accent)", private: "var(--green)" };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
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
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              lineHeight: 1.2,
              marginBottom: "4px",
              color: "var(--ink)",
            }}
          >
            {greeting}, {user?.name}
          </div>
          <div
            style={{ color: "var(--dim)", fontSize: "13px", fontWeight: 300 }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <button
          onClick={() => navigate("/new-event")}
          style={{
            padding: "9px 20px",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "9px",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          + New Event
        </button>
      </div>

      {/* Stats — 3 cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "26px",
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "var(--ink2)",
                }}
              >
                {loading ? "—" : s.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--faint)",
                  marginTop: "4px",
                  fontWeight: 300,
                  letterSpacing: ".02em",
                }}
              >
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "20px",
        }}
      >
        {/* Events */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--ink2)",
              }}
            >
              My Events
            </h3>
            <button
              onClick={() => navigate("/events")}
              style={{
                padding: "5px 14px",
                background: "transparent",
                color: "var(--accent-text)",
                border: "1.5px solid var(--accent)",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              View All
            </button>
          </div>
          <div style={{ padding: "14px 20px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--faint)",
                }}
              >
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--faint)",
                }}
              >
                No events yet. Create your first event!
              </div>
            ) : (
              events.slice(0, 5).map((e) => {
                const start = new Date(e.start_datetime);
                return (
                  <div
                    key={e.event_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "9px 0",
                      borderBottom: "1px solid var(--border2)",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: dotColors[e.visibility] || "var(--accent)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "var(--slate)",
                        }}
                      >
                        {e.title}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--dim)",
                          marginTop: "2px",
                          fontWeight: 300,
                        }}
                      >
                        {e.visibility} · {start.toLocaleDateString()}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--faint)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Notifications */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--ink2)",
              }}
            >
              Notifications
            </h3>
            <span
              style={{
                padding: "2px 9px",
                borderRadius: "20px",
                fontSize: "10px",
                fontWeight: 600,
                background: "var(--accent-soft)",
                color: "var(--accent-text)",
              }}
            >
              {notifications.length} new
            </span>
          </div>
          <div style={{ padding: "14px 20px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--faint)",
                }}
              >
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--faint)",
                }}
              >
                No notifications
              </div>
            ) : (
              notifications.slice(0, 4).map((n) => (
                <div
                  key={n.notification_id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border2)",
                  }}
                >
                  {/* all notifications use ⓘ with accent color */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      background: "var(--accent-soft)",
                      color: "var(--accent-text)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    ⓘ
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        lineHeight: 1.5,
                        fontWeight: 300,
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--faint)",
                        marginTop: "2px",
                      }}
                    >
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
