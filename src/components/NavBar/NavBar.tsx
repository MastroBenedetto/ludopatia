import { useState } from "react";
import {NavLink} from "react-router-dom"
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../../components/LoginModal/LoginModal";
import "./navbar.css";
import {useTheme} from "../../context/ThemeContext"

/**
 * 
 * Navbar fissa in alto, presente su tutte le pagine 
 * usa NavLink per gestire lo stato "attivo"
 * 
 */

export default function NavBar(){
    const { isAuthenticated, logout } = useAuth();
    const [openLogin, setOpenLogin] = useState(false);
    const {theme, toggle } = useTheme();

    return(
        <header className="navbar">
            <div className="navbar__inner container">
                <div className="navbar__brand">
                    <span className="navbar__logo" aria-hidden="true">🎲</span>
                    <span className="navbar__title"> Ludopatia, Portami via</span>    
                </div>

                <nav className="navbar__links">
                    <NavLink
                     to="/"
                     end 
                     className={({ isActive })=>
                        "navbar__link" + (isActive ? " is-active": "")
                    }
                    > Home </NavLink>

                    <NavLink
                     to="/superenalotto"
                     className={({ isActive })=>
                        "navbar__link" + (isActive ? " is-active": "")
                    }
                    > Superenalotto </NavLink>
                    
                    
                    <NavLink
                        to="/lotto"
                        className={({ isActive })=>
                            "navbar__link" + (isActive ? " is-active": "" )
                    }
                    > Lotto </NavLink>



                    <NavLink
                     to="/grattaevinci"
                     className={({ isActive })=>
                        "navbar__link" + (isActive ? " is-active":"")
                    }> Gratta e Vinci </NavLink>

                </nav>

            <div className="navbar__right">
                {/* THEME TOGGLE */}
                <button
                    aria-label="Cambia tema"
                    title={`Tema: ${theme}`}
                    className="navbar__themeToggle"
                    onClick={toggle}
                >
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>

                <div className="navbar__auth">
                    {!isAuthenticated ? (
                        <button className="navbar__btn" onClick={() => setOpenLogin(true)}>Login</button>
                    ) : (
                        <button className="navbar__btn navbar__btn--logout" onClick={logout}>Logout</button>
                    )}
                </div>
             </div>
            </div>
      {/* Modal di login */}
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </header>
    );
}