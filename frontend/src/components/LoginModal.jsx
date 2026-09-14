import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, X } from "lucide-react";
import "./LoginModal.css";

export default function LoginModal({ open, onClose, intendedAction }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables);
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-desc"
        ref={dialogRef}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close dialog" ref={closeBtnRef}>
          <X size={18} />
        </button>

        <div className="modal__icon">
          <Lock size={20} strokeWidth={2.2} />
        </div>

        <h2 className="modal__title" id="login-modal-title">
          Login required
        </h2>
        <p className="modal__desc" id="login-modal-desc">
          Please log in with your MIT-WPU account to submit a report.
        </p>

        <div className="modal__actions">
          <button
            className="btn btn--emerald btn--block"
            onClick={() => {
              onClose();
              navigate("/login", { state: { intendedAction } });
            }}
          >
            Login
          </button>
          <button
            className="btn btn--outline btn--block"
            onClick={() => {
              onClose();
              navigate("/register", { state: { intendedAction } });
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
