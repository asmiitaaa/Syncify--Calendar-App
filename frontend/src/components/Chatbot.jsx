import { useState, useRef, useEffect } from "react";
import API from "../api";

const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

const STEPS = {
  IDLE: "IDLE",
  COLLECTING: "COLLECTING",
  SUGGESTIONS: "SUGGESTIONS",
  BOOKED: "BOOKED",
};

const initialForm = {
  title: "",
  description: "",
  participantIds: "",
  dateRangeStart: "",
  dateRangeEnd: "",
  durationMinutes: "",
};

const durationOptions = [
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "45 minutes", value: "45" },
  { label: "1 hour", value: "60" },
  { label: "1.5 hours", value: "90" },
  { label: "2 hours", value: "120" },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(STEPS.IDLE);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: 'Hi! I\'m your scheduling assistant 📅 I can find a free time slot that works for everyone. Type "schedule" to get started!',
    },
  ]);
  const [input, setInput] = useState("");
  const [form, setForm] = useState(initialForm);
  const [formStep, setFormStep] = useState(0);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [specialValue, setSpecialValue] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const formQuestions = [
    {
      key: "title",
      label: "What's the event title?",
      placeholder: "e.g. Team Standup",
      type: "text",
    },
    {
      key: "description",
      label: "Any description? (optional — click Send to skip)",
      placeholder: "e.g. Weekly sync meeting",
      type: "text",
      optional: true,
    },
    {
      key: "participantIds",
      label: "Enter participant User IDs (comma separated)",
      placeholder: "e.g. 2,3,4",
      type: "text",
    },
    {
      key: "dateRangeStart",
      label: "Start of date range?",
      placeholder: "",
      type: "date",
    },
    {
      key: "dateRangeEnd",
      label: "End of date range?",
      placeholder: "",
      type: "date",
    },
    {
      key: "durationMinutes",
      label: "How long should the event be?",
      placeholder: "",
      type: "select",
    },
  ];

  function addMsg(msgs, from, text, extra = {}) {
    return [...msgs, { from, text, ...extra }];
  }

  function resetChat() {
    setStep(STEPS.IDLE);
    setForm(initialForm);
    setFormStep(0);
    setPendingBooking(null);
    setSpecialValue("");
    setInput("");
    setMessages([
      {
        from: "bot",
        text: 'Hi! I\'m your scheduling assistant 📅 I can find a free time slot that works for everyone. Type "schedule" to get started!',
      },
    ]);
  }

  const currentQuestion = formQuestions[formStep];
  const isSpecialField =
    step === STEPS.COLLECTING &&
    (currentQuestion?.type === "date" || currentQuestion?.type === "select");

  async function handleSend() {
    const trimmed = input.trim();
    const currentQ = formQuestions[formStep];

    if (step === STEPS.COLLECTING && isSpecialField) {
      if (!specialValue) return;
      const userMsg =
        durationOptions.find((d) => d.value === specialValue)?.label ||
        specialValue;
      setMessages((prev) => addMsg(prev, "user", userMsg));
      await processFormAnswer(specialValue, currentQ);
      setSpecialValue("");
      return;
    }

    if (step === STEPS.COLLECTING && currentQ?.optional) {
      setInput("");
      setMessages((prev) => addMsg(prev, "user", trimmed || "(skipped)"));
      await processFormAnswer(trimmed, currentQ);
      return;
    }

    if (!trimmed) return;
    setInput("");
    setMessages((prev) => addMsg(prev, "user", trimmed));

    if (step === STEPS.IDLE) {
      if (trimmed.toLowerCase().includes("schedule")) {
        setStep(STEPS.COLLECTING);
        setFormStep(0);
        setSpecialValue("");
        setMessages(
          (prev) =>
            addMsg(prev, "user", trimmed) &&
            addMsg(prev, "bot", formQuestions[0].label),
        );
        // re-do properly:
        setMessages((prev) => {
          let m = addMsg(prev, "bot", formQuestions[0].label);
          return m;
        });
      } else {
        setMessages((prev) =>
          addMsg(
            prev,
            "bot",
            'Type "schedule" to start finding a free slot for your team!',
          ),
        );
      }
      return;
    }

    if (step === STEPS.COLLECTING) {
      await processFormAnswer(trimmed, currentQ);
    }
  }

  async function processFormAnswer(value, currentQ) {
    const updatedForm = { ...form, [currentQ.key]: value };
    setForm(updatedForm);

    const nextStep = formStep + 1;

    if (nextStep < formQuestions.length) {
      setFormStep(nextStep);
      setSpecialValue("");
      setMessages((prev) => addMsg(prev, "bot", formQuestions[nextStep].label));
    } else {
      // All fields collected — show checking message FIRST, then call API
      setMessages((prev) =>
        addMsg(
          prev,
          "bot",
          "Got it! Let me check everyone's availability... ⏳",
        ),
      );
      setLoading(true);

      try {
        const currentUser = getUser();
        const participantIds = updatedForm.participantIds
          .split(",")
          .map((p) => parseInt(p.trim()))
          .filter((p) => !isNaN(p));

        const res = await API.post("/chatbot/suggest-slots", {
          creatorId: currentUser?.user_id,
          participantIds,
          title: updatedForm.title,
          description: updatedForm.description,
          dateRangeStart: updatedForm.dateRangeStart,
          dateRangeEnd: updatedForm.dateRangeEnd,
          durationMinutes: parseInt(updatedForm.durationMinutes),
        });

        if (res.data.success && res.data.data.suggestions.length > 0) {
          setPendingBooking({
            creatorId: currentUser?.user_id,
            participantIds,
            title: updatedForm.title,
            description: updatedForm.description,
          });
          setStep(STEPS.SUGGESTIONS);
          setMessages((prev) =>
            addMsg(
              prev,
              "bot",
              "Here are the available slots I found! Click one to book it:",
              {
                slots: res.data.data.suggestions,
              },
            ),
          );
        } else {
          setMessages((prev) =>
            addMsg(
              prev,
              "bot",
              "😔 No common free slots found in that date range. Try a wider range or fewer participants.",
            ),
          );
          setStep(STEPS.IDLE);
        }
      } catch (err) {
        setMessages((prev) =>
          addMsg(
            prev,
            "bot",
            "Something went wrong while checking availability. Please try again.",
          ),
        );
        setStep(STEPS.IDLE);
      } finally {
        setLoading(false);
      }
    }
  }

  async function bookSlot(slot) {
    setLoading(true);
    setMessages((prev) => {
      let m = addMsg(prev, "user", `Book: ${formatSlot(slot)}`);
      return addMsg(m, "bot", "Booking the slot... ⏳");
    });

    try {
      const startDatetime = new Date(slot.start)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const endDatetime = new Date(slot.end)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await API.post("/chatbot/book-slot", {
        ...pendingBooking,
        startDatetime,
        endDatetime,
        visibility: "shared",
      });

      setStep(STEPS.BOOKED);
      setMessages((prev) =>
        addMsg(
          prev,
          "bot",
          `✅ Event "${pendingBooking.title}" has been booked for ${formatSlot(slot)}! All participants have been notified.`,
        ),
      );
    } catch (err) {
      setMessages((prev) =>
        addMsg(prev, "bot", "Failed to book the slot. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  function formatSlot(slot) {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    return `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !isSpecialField) handleSend();
  }

  function renderInput() {
    if (step === STEPS.COLLECTING && currentQuestion?.type === "date") {
      return (
        <input
          type="date"
          value={specialValue}
          onChange={(e) => setSpecialValue(e.target.value)}
          style={inputStyle}
        />
      );
    }
    if (step === STEPS.COLLECTING && currentQuestion?.type === "select") {
      return (
        <select
          value={specialValue}
          onChange={(e) => setSpecialValue(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select duration...</option>
          {durationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          step === STEPS.IDLE
            ? 'Type "schedule" to begin...'
            : step === STEPS.COLLECTING
              ? currentQuestion?.placeholder || ""
              : step === STEPS.BOOKED
                ? 'Type "schedule" to start again...'
                : "Choose a slot above..."
        }
        disabled={loading || step === STEPS.SUGGESTIONS}
        style={{
          ...inputStyle,
          background: step === STEPS.SUGGESTIONS ? "var(--surface)" : "#ffffff",
        }}
      />
    );
  }

  const inputStyle = {
    flex: 1,
    padding: "9px 14px",
    border: "1.5px solid var(--border)",
    borderRadius: "10px",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "13px",
    outline: "none",
    background: "#ffffff",
    color: "var(--ink)",
    width: "100%",
  };

  const isSendDisabled =
    loading ||
    step === STEPS.SUGGESTIONS ||
    (isSpecialField && !specialValue) ||
    (!isSpecialField && !input.trim() && step !== STEPS.COLLECTING) ||
    (!isSpecialField && !input.trim() && !currentQuestion?.optional);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: "var(--accent)",
          color: "white",
          border: "none",
          fontSize: "22px",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(92,110,248,.4)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Scheduling Assistant"
      >
        {open ? "✕" : "📅"}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "92px",
            right: "28px",
            width: "380px",
            maxHeight: "560px",
            background: "#ffffff", // solid white - no transparency
            border: "1px solid var(--border)",
            borderRadius: "18px",
            boxShadow: "0 12px 48px rgba(0,0,0,.2)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "var(--accent)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "20px" }}>📅</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>
                  Scheduling Assistant
                </div>
                <div style={{ fontSize: "11px", opacity: 0.85 }}>
                  Finds free slots for your team
                </div>
              </div>
            </div>
            <button
              onClick={resetChat}
              style={{
                background: "rgba(255,255,255,.2)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontSize: "11px",
                padding: "4px 8px",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Reset
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#ffffff",
            }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.from === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius:
                        msg.from === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      background:
                        msg.from === "user" ? "var(--accent)" : "#f6f6fb",
                      color: msg.from === "user" ? "white" : "var(--ink)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Slot buttons */}
                {msg.slots && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      marginTop: "8px",
                    }}
                  >
                    {msg.slots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => bookSlot(slot)}
                        disabled={loading || step === STEPS.BOOKED}
                        style={{
                          padding: "10px 14px",
                          background: "#ffffff",
                          border: "1.5px solid var(--accent)",
                          borderRadius: "10px",
                          color: "var(--accent)",
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor:
                            step === STEPS.BOOKED ? "not-allowed" : "pointer",
                          textAlign: "left",
                          opacity: step === STEPS.BOOKED ? 0.5 : 1,
                        }}
                      >
                        🕐 {formatSlot(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "#f6f6fb",
                    fontSize: "13px",
                    color: "var(--muted)",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "8px",
              flexShrink: 0,
              alignItems: "center",
              background: "#ffffff",
            }}
          >
            {renderInput()}
            <button
              onClick={handleSend}
              disabled={isSendDisabled}
              style={{
                padding: "9px 16px",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: isSendDisabled ? "not-allowed" : "pointer",
                opacity: isSendDisabled ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
