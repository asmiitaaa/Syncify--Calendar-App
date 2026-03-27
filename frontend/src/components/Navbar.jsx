import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const authPages = ["/login", "/register"];
  const isAuth = authPages.includes(location.pathname);

  if (isAuth) return null;

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const navLinks = [
    { to: "/", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/events", label: "My Events" },
    { to: "/new-event", label: "+ New Event" },
    // only show admin if user is admin
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 12px rgba(92,110,248,.06)",
      }}
    >
      <div
        style={{
          fontFamily: "DM Serif Display, serif",
          fontSize: "22px",
          color: "var(--accent)",
          letterSpacing: "-0.5px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        📅 Syncify
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              background:
                location.pathname === link.to ? "var(--accent-soft)" : "none",
              color:
                location.pathname === link.to
                  ? "var(--accent)"
                  : "var(--slate)",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--slate)",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
        <span>{user?.name}</span>
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "7px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--red)",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
