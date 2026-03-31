import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import { showToast } from "../components/Toast";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams(); // event_id from the url
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

  const sectionLabelStyle = {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: ".08em",
    color: "var(--muted)",
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
          color: "var(--muted)",
          fontSize: "14px",
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
            fontFamily: "DM Serif Display, serif",
            fontSize: "28px",
            marginBottom: "4px",
          }}
        >
          Edit Event
        </div>
        <div style={{ color: "var(--slate)", fontSize: "14px" }}>
          Update the details below — changes will be logged automatically
        </div>
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid var(--border)",
            background:
              "linear-gradient(135deg, var(--accent-soft), var(--white))",
          }}
        >
          <h2
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "22px",
            }}
          >
            Event Details
          </h2>
          <p
            style={{
              color: "var(--slate)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Fields marked with * are required
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
          {/* Basic Info */}
          <div style={{ marginBottom: "24px" }}>
            <div style={sectionLabelStyle}>Basic Information</div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Event Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Sprint Planning Meeting"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional — describe what this event is about..."
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "90px",
                }}
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
                    boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                  }}
                ></span>
              </button>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>
                This is a recurring event
              </span>
            </div>
            {isRecurring && (
              <div
                style={{
                  background: "var(--surface)",
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
                padding: "10px 20px",
                background: "var(--white)",
                color: "var(--accent)",
                border: "1.5px solid var(--accent)",
                borderRadius: "10px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
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
                padding: "10px 28px",
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
