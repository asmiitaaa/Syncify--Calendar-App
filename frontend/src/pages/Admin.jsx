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
      blue: { background: "var(--accent-soft)", color: "var(--accent)" },
      green: { background: "var(--green-soft)", color: "#16a34a" },
      orange: { background: "var(--orange-soft)", color: "#d97706" },
      gray: { background: "var(--surface)", color: "var(--slate)" },
      purple: { background: "var(--purple-soft)", color: "#9333ea" },
      red: { background: "var(--red-soft)", color: "var(--red)" },
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

  const actionColors = {
    created: "green",
    updated: "blue",
    deleted: "red",
  };

  const statCards = [
    {
      icon: "👥",
      label: "Total Users",
      value: users.length,
      color: "var(--accent-soft)",
    },
    {
      icon: "📋",
      label: "Audit Logs",
      value: auditLogs.length,
      color: "var(--purple-soft)",
    },
    {
      icon: "✅",
      label: "Active Users",
      value: users.filter((u) => u.is_active).length,
      color: "var(--green-soft)",
    },
    {
      icon: "📅",
      label: "Total Events",
      value: users.reduce((acc, u) => acc + (u.total_events || 0), 0),
      color: "var(--orange-soft)",
    },
  ];

  const tabStyle = (tab) => ({
    padding: "8px 20px",
    border: "none",
    borderRadius: "8px",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    background: activeTab === tab ? "var(--accent)" : "var(--white)",
    color: activeTab === tab ? "white" : "var(--slate)",
    border: activeTab === tab ? "none" : "1.5px solid var(--border)",
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: "28px",
            marginBottom: "4px",
          }}
        >
          Admin Panel
        </div>
        <div style={{ color: "var(--slate)", fontSize: "14px" }}>
          Manage users, view audit logs, and monitor system activity
        </div>
      </div>

      {/* Stat Cards */}
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
                background: s.color,
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button style={tabStyle("users")} onClick={() => setActiveTab("users")}>
          👥 Users
        </button>
        <button style={tabStyle("logs")} onClick={() => setActiveTab("logs")}>
          📋 Audit Logs
        </button>
      </div>

      {/* Users Table */}
      {activeTab === "users" && (
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
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 600 }}>All Users</h3>
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
                      color: "var(--muted)",
                    }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.user_id}
                    style={{ borderBottom: "1px solid var(--surface)" }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: "var(--muted)",
                      }}
                    >
                      #{u.user_id}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: "14px" }}>
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "14px",
                        color: "var(--slate)",
                      }}
                    >
                      {u.email}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "14px" }}>
                      {u.total_events || 0}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {badge(
                        u.is_active ? "Active" : "Inactive",
                        u.is_active ? "green" : "gray",
                      )}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: "var(--slate)",
                      }}
                    >
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => deleteUser(u.user_id)}
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
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Audit Logs</h3>
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
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--muted)",
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
                      color: "var(--muted)",
                    }}
                  >
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid var(--surface)" }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        fontWeight: 500,
                        fontSize: "14px",
                      }}
                    >
                      {log.event_title || `Event #${log.event_id}`}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {badge(log.action, actionColors[log.action] || "gray")}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "14px",
                        color: "var(--slate)",
                      }}
                    >
                      {log.performed_by_name || `User #${log.performed_by}`}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: "var(--muted)",
                        maxWidth: "280px",
                      }}
                    >
                      {log.details}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: "var(--slate)",
                        whiteSpace: "nowrap",
                      }}
                    >
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
