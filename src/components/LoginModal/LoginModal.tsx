import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./login-modal.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LoginModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@example.com"); // precompilato per comodità
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      onClose();
    } else {
      setError(res.error ?? "Errore di login");
    }
  };

  return (
    <div className="lm__backdrop" onClick={onClose}>
      <div className="lm__modal card" onClick={(e) => e.stopPropagation()}>
        <h2 className="lm__title">Login</h2>
        <p className="lm__hint">Usa demo@example.com / password123</p>

        <form className="lm__form" onSubmit={onSubmit}>
          <label className="lm__label">
            Email
            <input
              className="lm__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="lm__label">
            Password
            <input
              className="lm__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="lm__error">{error}</div>}

          <div className="lm__actions">
            <button className="lm__btn lm__btn--ghost" type="button" onClick={onClose}>
              Annulla
            </button>
            <button className="lm__btn" type="submit" disabled={loading}>
              {loading ? "Attendere..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
