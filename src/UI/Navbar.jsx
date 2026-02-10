import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../UIX/Navbar.css";
import { useTranslation } from "../i18n/useTranslation";

export default function Navbar({ setMenuOpen, menuOpen }) {
  const { t } = useTranslation();
  const [userSession, setUserSession] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [widthWindow, setWidthWindow] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setWidthWindow(window.innerWidth);
      setMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      setUserSession({ id: userId });
      fetchUserData(userId);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("Users")
        .select("nome, cognome")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (data) {
        setUserSession((prev) => ({ ...prev, nome: data.nome, cognome: data.cognome }));
      }
    } catch (err) {
      console.error("Errore nel recupero utente:", err.message);
      setUserSession(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    setUserSession(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
        <span className="line top"></span>
        <span className="line bottom"></span>
      </div>
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src="/logo.webp" alt="logo autonoleggio" />
      </div>
      <div className="signin-container">
        {userSession ? (
          <div className="user-info">
            <span className="hi-text">
              {t("navbar.hi")}, {userSession.nome} {userSession.cognome}
            </span>
            <button className="logout-btn" onClick={handleLogout}>{t("navbar.logout")}</button>
          </div>
        ) : (
          <button className="signin-btn" onClick={() => navigate("/login")}>
            {mobile ? t("navbar.signUp") : t("navbar.signIn")}
          </button>
        )}
      </div>
    </nav>
  );
}
