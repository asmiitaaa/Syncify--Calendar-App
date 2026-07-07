import { useState, useEffect } from "react";
import API from "../api";
import { showToast } from "../components/Toast";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [usersRes, logsRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/audit-logs"),
      ]);
      setUsers(usersRes.data);
      setAuditLogs(logsRes.data);
    } catch (err) {
      showToast("Error loading admin data");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      showToast("User deleted successfully");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting user");
    }
  }

  const badge = (text, color) => {
    const colors = {
      blue: { background: "var(--accent-soft)", color: "var(--accent-text)" },
      green: { background: "var(--green-soft)", color: "var(--green)" },
      orange: { background: "var(--orange-soft)", color: "var(--orange)" },
      gray: { background: "var(--surface2)", color: "var(--muted)" },
      purple: { background: "var(--purple-soft)", color: "var(--purple)" },
      red: { background: "var(--red-soft)", color: "var(--red)" },
    };
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "2px 9px",
          borderRadius: "20px",
          fontSize: "10px",
          fontWeight: 500,
          whiteSpace: "nowrap",
          ...colors[color],
        }}
      >
        {text}
      </span>
    );
  };

  const actionColors = {
    created: "green",
    updated: "blue",
    deleted: "red",
  };

  // removed Active Users — now only 2 stat cards
  // 🗒 for Total Events, ⚜ for Audit Logs
  const statCards = [
    {
      icon: "𖨆",
      label: "Total Users",
      value: users.length,
      bg: "var(--accent-soft)",
    },
    {
      icon: "🗒",
      label: "Total Events",
      value: users.reduce((acc, u) => acc + (u.total_events || 0), 0),
      bg: "var(--orange-soft)",
    },
    {
      icon: "⚜",
      label: "Audit Logs",
      value: auditLogs.length,
      bg: "var(--purple-soft)",
    },
  ];

  const tabStyle = (tab) => ({
    padding: "7px 18px",
    borderRadius: "8px",
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    background: activeTab === tab ? "var(--accent)" : "var(--surface)",
    color: activeTab === tab ? "white" : "var(--muted)",
    border: activeTab === tab ? "none" : "1.5px solid var(--border)",
  });

  const thStyle = {
    background: "var(--surface2)",
    padding: "10px 16px",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: 700,
    color: "var(--dim)",
    letterSpacing: ".06em",
    textTransform: "uppercase",
    borderBottom: "1px solid var(--border)",
  };

  const tdStyle = {
    padding: "12px 16px",
    fontSize: "12px",
    color: "var(--slate)",
    borderBottom: "1px solid var(--border2)",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            marginBottom: "4px",
            color: "var(--ink)",
          }}
        >
          Admin Panel
        </div>
        <div style={{ color: "var(--dim)", fontSize: "13px", fontWeight: 300 }}>
          Manage users, view audit logs, and monitor system activity
        </div>
      </div>

      {/* Stat Cards — 3 cards, no Active Users */}
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
                }}
              >
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button style={tabStyle("users")} onClick={() => setActiveTab("users")}>
          𖨆 Users
        </button>
        <button style={tabStyle("logs")} onClick={() => setActiveTab("logs")}>
          ⚜ Audit Logs
        </button>
      </div>

      {/* Users Table */}
      {activeTab === "users" && (
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
              All Users
            </h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "ID",
                  "Name",
                  "Email",
                  "Total Events",
                  "Status",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={thStyle}>
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
                      color: "var(--faint)",
                    }}
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--faint)",
                    }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id}>
                    <td style={{ ...tdStyle, color: "var(--dim)" }}>
                      #{u.user_id}
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "var(--accent-soft)",
                            color: "var(--accent-text)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: "13px",
                            color: "var(--ink2)",
                          }}
                        >
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.total_events || 0}</td>
                    <td style={tdStyle}>
                      {badge(
                        u.is_active ? "Active" : "Inactive",
                        u.is_active ? "green" : "gray",
                      )}
                    </td>
                    <td style={tdStyle}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deleteUser(u.user_id)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "7px",
                          background: "var(--surface2)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "white",
                        }}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs Table */}
      {activeTab === "logs" && (
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
              Audit Logs
            </h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Event",
                  "Action",
                  "Performed By",
                  "Details",
                  "Timestamp",
                ].map((h) => (
                  <th key={h} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--faint)",
                    }}
                  >
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--faint)",
                    }}
                  >
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 500,
                        color: "var(--ink2)",
                      }}
                    >
                      {log.event_title || `Event #${log.event_id}`}
                    </td>
                    <td style={tdStyle}>
                      {badge(log.action, actionColors[log.action] || "gray")}
                    </td>
                    <td style={tdStyle}>
                      {log.performed_by_name || `User #${log.performed_by}`}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: "280px",
                        color: "var(--muted)",
                      }}
                    >
                      {log.details}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {new Date(log.action_timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
