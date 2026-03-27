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

  const statCards = [
    {
      icon: "📅",
      label: "Total Events",
      value: stats?.total_events ?? "—",
      color: "blue",
    },
    {
      icon: "⏳",
      label: "Pending Invites",
      value: stats?.pending_invites ?? "—",
      color: "orange",
    },
    {
      icon: "🔁",
      label: "Recurring Events",
      value: stats?.recurring_events ?? "—",
      color: "purple",
    },
    {
      icon: "✅",
      label: "Shared Events",
      value:
        stats?.events_by_visibility?.find((v) => v.visibility === "shared")
          ?.total ?? 0,
      color: "green",
    },
  ];

  const iconBg = {
    blue: "var(--accent-soft)",
    orange: "var(--orange-soft)",
    purple: "var(--purple-soft)",
    green: "var(--green-soft)",
  };
  const notifIcons = {
    event_created: "📩",
    event_updated: "📝",
    reminder: "🔔",
  };
  const notifBg = {
    event_created: "var(--purple-soft)",
    event_updated: "var(--orange-soft)",
    reminder: "var(--accent-soft)",
  };
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
              fontFamily: "DM Serif Display, serif",
              fontSize: "28px",
              lineHeight: 1.2,
              marginBottom: "4px",
            }}
          >
            {greeting}, {user?.name}
          </div>
          <div style={{ color: "var(--slate)", fontSize: "14px" }}>
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

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "20px 22px",
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
                background: iconBg[s.color],
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
              <div style={{ fontSize: "26px", fontWeight: 600, lineHeight: 1 }}>
                {loading ? "—" : s.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginTop: "3px",
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
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 600 }}>My Events</h3>
            <button
              onClick={() => navigate("/events")}
              style={{
                padding: "8px 18px",
                background: "var(--white)",
                color: "var(--accent)",
                border: "1.5px solid var(--accent)",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              View All
            </button>
          </div>
          <div style={{ padding: "16px 22px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--muted)",
                }}
              >
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--muted)",
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
                      padding: "10px 0",
                      borderBottom: "1px solid var(--surface)",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: dotColors[e.visibility] || "var(--accent)",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>
                        {e.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        {e.visibility} · {start.toLocaleDateString()}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--slate)",
                        fontWeight: 500,
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
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Notifications</h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 9px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                background: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              {notifications.length} new
            </span>
          </div>
          <div style={{ padding: "16px 22px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--muted)",
                }}
              >
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "var(--muted)",
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
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--surface)",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background:
                        notifBg[n.notification_type] || "var(--surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      flexShrink: 0,
                    }}
                  >
                    {notifIcons[n.notification_type] || "🔔"}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--ink2)",
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        marginTop: "3px",
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
