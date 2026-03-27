import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
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
      showToast(`Account created! Welcome, ${res.data.name}!`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid var(--border)",
    borderRadius: "10px",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "14px",
    outline: "none",
    background: "var(--white)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "6px",
    color: "var(--ink2)",
  };

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
          width: "480px",
          maxWidth: "90vw",
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
          Create your account
        </h2>
        <p
          style={{
            color: "var(--slate)",
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          Join and start collaborating on events
        </p>

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Alex Johnson"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                style={inputStyle}
              />
            </div>
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
            {loading ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
