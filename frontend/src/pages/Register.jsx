// Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields"); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters"); return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { name: form.name, email: form.email, password: form.password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({
        user_id: res.data.user_id, name: res.data.name, email: res.data.email, role: res.data.role,
      }));
      showToast(`Account created! Welcome, ${res.data.name}!`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)",
    borderRadius: "9px", fontFamily: "var(--font-sans)", fontSize: "13px",
    outline: "none", background: "var(--surface2)", color: "var(--ink)",
  };

  const labelStyle = {
    display: "block", fontSize: "12px", fontWeight: 400, marginBottom: "6px", color: "var(--muted)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {/* Left panel */}
      <div style={{
        width: "40%",
        background: "linear-gradient(160deg, #1a1a2e 0%, #0f0f1a 100%)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "16px", flexShrink: 0,
      }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "60px", color: "var(--accent-text)", opacity: 0.3 }}>⚜</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--ink2)", opacity: 0.5 }}>Syncify</div>
        <div style={{ fontSize: "12px", color: "var(--faint)", fontWeight: 300, textAlign: "center", maxWidth: "200px", lineHeight: 1.6 }}>
          Your collaborative calendar and scheduling system
        </div>
      </div>

      {/* Right — register card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "44px 40px", width: "460px", maxWidth: "90%",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--accent-text)" }}>⚜</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--accent-text)", fontWeight: 600 }}>Syncify</span>
          </div>

          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", marginBottom: "4px", color: "var(--ink)" }}>
            Create your account
          </h2>
          <p style={{ color: "var(--faint)", fontSize: "12px", marginBottom: "28px", fontWeight: 300 }}>
            Join and start collaborating on events
          </p>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Full name</label>
              <input name="name" value={form.name} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            {error && <div style={{ color: "var(--red)", fontSize: "12px", marginBottom: "12px" }}>{error}</div>}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "10px", background: "var(--accent)",
              color: "white", border: "none", borderRadius: "9px",
              fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "var(--faint)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent-text)", textDecoration: "none", fontWeight: 500 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}