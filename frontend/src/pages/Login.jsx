import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: res.data.user_id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        }),
      );
      showToast(`Welcome back, ${res.data.name}! `);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg,#f0f1ff 0%,#fafaff 60%,#f5f0ff 100%)",
      }}
    >
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "48px 44px",
          width: "420px",
          boxShadow: "0 8px 40px rgba(92,110,248,.1)",
        }}
      >
        <h2
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: "28px",
            marginBottom: "6px",
          }}
        >
          Welcome back!
        </h2>
        <p
          style={{
            color: "var(--slate)",
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          Sign in to manage your calendar and events
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
                color: "var(--ink2)",
              }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email          "
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: "10px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
                color: "var(--ink2)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: "10px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                color: "var(--red)",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "4px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "13px",
            color: "var(--slate)",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
