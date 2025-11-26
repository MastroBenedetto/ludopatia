import { useState,useRef,useEffect } from "react";
import {NavLink, useLocation} from "react-router-dom"
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../../components/LoginModal/LoginModal";
import "./navbar.css";
import {useTheme} from "../../context/ThemeContext"

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  const [openLogin, setOpenLogin] = useState(false);
  const { theme, toggle } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();

  // close mobile menu on route change (clicking a NavLink)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // click outside to close mobile menu
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!mobileOpen) return;
      const tgt = e.target as Node;
      // if click is inside dropdownRef or on hamburger, ignore
      if (
        dropdownRef.current?.contains(tgt) ||
        hamburgerRef.current?.contains(tgt)
      ) {
        return;
      }
      setMobileOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [mobileOpen]);

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner container">
        <div className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">🎲</span>
          <span className="navbar__title">Ludopatia, portami via</span>
        </div>

        <nav
          className={`navbar__links ${mobileOpen ? "is-open" : ""}`}
          ref={dropdownRef as any}
          aria-hidden={!mobileOpen && window.innerWidth < 640}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
            onClick={() => setMobileOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/superenalotto"
            className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
            onClick={() => setMobileOpen(false)}
          >
            Superenalotto
          </NavLink>

          <NavLink
            to="/gratta"
            className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
            onClick={() => setMobileOpen(false)}
          >
            Gratta e Vinci
          </NavLink>

          <NavLink
            to="/lotto"
            className={({ isActive }) => "navbar__link" + (isActive ? " is-active" : "")}
            onClick={() => setMobileOpen(false)}
          >
            Lotto
          </NavLink>
        </nav>

        <div className="navbar__right">
          <button
            aria-label="Cambia tema"
            title={`Tema: ${theme}`}
            className="navbar__themeToggle"
            onClick={toggle}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div className="navbar__auth hide-mobile">
            {!isAuthenticated ? (
              <button className="navbar__btn" onClick={() => setOpenLogin(true)}>Login</button>
            ) : (
              <button className="navbar__btn navbar__btn--logout" onClick={logout}>Logout</button>
            )}
          </div>

          {/* mobile hamburger */}
          <button
            ref={hamburgerRef}
            className="navbar__hamburger"
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((s) => !s)}
          >
            <span className={`hamburger-line ${mobileOpen ? "open" : ""}`}></span>
            <span className={`hamburger-line ${mobileOpen ? "open" : ""}`}></span>
            <span className={`hamburger-line ${mobileOpen ? "open" : ""}`}></span>
          </button>
        </div>
      </div>

      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </header>
  );
}