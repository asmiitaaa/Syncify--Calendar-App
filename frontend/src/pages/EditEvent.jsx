import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
    visibility: "shared",
    recurrence_type: "weekly",
    recurrence_interval: 1,
    recurrence_end: "",
  });

  useEffect(() => {
    loadEvent();
  }, []);

  async function loadEvent() {
    try {
      const res = await API.get(`/events/${id}`);
      const e = res.data;
      setIsRecurring(e.is_recurring === 1 || e.is_recurring === true);
      setForm({
        title: e.title || "",
        description: e.description || "",
        start_datetime: e.start_datetime ? e.start_datetime.slice(0, 16) : "",
        end_datetime: e.end_datetime ? e.end_datetime.slice(0, 16) : "",
        visibility: e.visibility || "shared",
        recurrence_type: e.recurrence_type || "weekly",
        recurrence_interval: e.recurrence_interval || 1,
        recurrence_end: e.recurrence_end || "",
      });
    } catch (err) {
      showToast("Error loading event");
      navigate("/events");
    } finally {
      setFetching(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.start_datetime || !form.end_datetime) {
      showToast("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await API.put(`/events/${id}`, {
        title: form.title,
        description: form.description,
        start_datetime: form.start_datetime,
        end_datetime: form.end_datetime,
        visibility: form.visibility,
        is_recurring: isRecurring,
        recurrence_type: isRecurring ? form.recurrence_type : null,
        recurrence_interval: isRecurring
          ? parseInt(form.recurrence_interval)
          : 1,
        recurrence_end: isRecurring ? form.recurrence_end : null,
      });
      showToast("Event updated successfully!");
      navigate("/events");
    } catch (err) {
      showToast(err.response?.data?.message || "Error updating event");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid var(--border)",
    borderRadius: "8px",
    fontFamily: "var(--font-sans)",
    fontSize: "13px",
    outline: "none",
    background: "var(--surface2)",
    color: "var(--ink)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 400,
    marginBottom: "5px",
    color: "var(--muted)",
  };

  const sectionLabelStyle = {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: ".08em",
    color: "var(--dim)",
    textTransform: "uppercase",
    marginBottom: "12px",
  };

  if (fetching) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 60px)",
          color: "var(--faint)",
          fontSize: "13px",
          background: "var(--bg)",
        }}
      >
        Loading event...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "28px",
            marginBottom: "4px",
            color: "var(--ink)",
          }}
        >
          Edit Event
        </div>
        <div style={{ color: "var(--dim)", fontSize: "13px", fontWeight: 300 }}>
          Update the details below — changes will be logged automatically
        </div>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface2)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
              color: "var(--ink2)",
            }}
          >
            Event Details
          </h2>
          <p
            style={{
              color: "var(--faint)",
              fontSize: "12px",
              marginTop: "4px",
              fontWeight: 300,
            }}
          >
            Fields marked with * are required
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
          {/* Basic Info */}
          <div style={{ marginBottom: "24px" }}>
            <div style={sectionLabelStyle}>Basic Information</div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Event Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event title"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description (optional)"
                style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ marginBottom: "24px" }}>
            <div style={sectionLabelStyle}>Date & Time</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="start_datetime"
                  value={form.start_datetime}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="end_datetime"
                  value={form.end_datetime}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Recurrence */}
          <div style={{ marginBottom: "24px" }}>
            <div style={sectionLabelStyle}>Recurrence</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "4px",
              }}
            >
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                style={{
                  width: "42px",
                  height: "24px",
                  borderRadius: "12px",
                  background: isRecurring ? "var(--accent)" : "var(--border)",
                  position: "relative",
                  cursor: "pointer",
                  border: "none",
                  transition: "background .2s",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: isRecurring ? "21px" : "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "white",
                    transition: "left .2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,.3)",
                  }}
                />
              </button>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "var(--slate)",
                }}
              >
                This is a recurring event
              </span>
            </div>
            {isRecurring && (
              <div
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "16px",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Recurrence Type</label>
                    <select
                      name="recurrence_type"
                      value={form.recurrence_type}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Repeat Every (interval)</label>
                    <input
                      type="number"
                      name="recurrence_interval"
                      value={form.recurrence_interval}
                      onChange={handleChange}
                      min="1"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Recurrence End Date</label>
                  <input
                    type="date"
                    name="recurrence_end"
                    value={form.recurrence_end}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visibility */}
          <div style={{ marginBottom: "24px" }}>
            <div style={sectionLabelStyle}>Visibility</div>
            <select
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
              style={{ ...inputStyle, maxWidth: "300px" }}
            >
              <option value="private">🔒 Private</option>
              <option value="shared">👥 Shared</option>
            </select>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              paddingTop: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/events")}
              style={{
                padding: "9px 20px",
                background: "transparent",
                color: "var(--accent-text)",
                border: "1.5px solid var(--accent)",
                borderRadius: "9px",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "9px 24px",
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
