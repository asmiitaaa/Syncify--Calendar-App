import { useState, useEffect } from "react";

let toastFn = null;
export function showToast(msg) {
  if (toastFn) toastFn(msg);
}

export default function Toast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    toastFn = (m) => {
      setMsg(m);
      setVisible(true);
      setTimeout(() => setVisible(false), 2800);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        background: "var(--ink)",
        color: "white",
        padding: "12px 20px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        zIndex: 300,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "all .3s",
        pointerEvents: "none",
      }}
    >
      {msg}
    </div>
  );
}
