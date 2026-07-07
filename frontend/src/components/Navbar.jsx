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
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* brand — ⚜ fleur de lis + Syncify in Lora serif */}
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--accent-text)",
          letterSpacing: "-0.3px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "26px" }}>⚜</span>
        Syncify
      </div>

      {/* nav links */}
      <div style={{ display: "flex", gap: "4px" }}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 400,
              textDecoration: "none",
              background:
                location.pathname === link.to ? "var(--accent-soft)" : "none",
              color:
                location.pathname === link.to
                  ? "var(--accent-text)"
                  : "var(--muted)",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* user info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13px",
          fontWeight: 400,
          color: "var(--muted)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
        <span style={{ color: "var(--muted)", fontWeight: 300 }}>
          {user?.name}
        </span>
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "7px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 400,
            color: "var(--red)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
