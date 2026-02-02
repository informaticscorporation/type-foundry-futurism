import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../UIX/Navbar.css";

export default function Navbar({ setMenuOpen, menuOpen }) {
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
      setUserSession({ id: userId }); // segna che esiste una sessione
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
        setUserSession((prev) => ({
          ...prev,
          nome: data.nome,
          cognome: data.cognome,
        }));
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
      {/* HAMBURGER MENU */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="line top"></span>
        <span className="line bottom"></span>
      </div>

      {/* LOGO CENTRALE */}
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src="/logo.webp" alt="logo autonoleggio" />
      </div>

      {/* SIGN IN / SIGN UP oppure “Hi, Nome Cognome” */}
      <div className="signin-container">
        {userSession ? (
          <div className="user-info">
            <span className="hi-text">
              Hi, {userSession.nome} {userSession.cognome}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button
            className="signin-btn"
            onClick={() => navigate("/login")}
          >
            {mobile ? "Sign up" : "Sign In / Sign Up"}
          </button>
        )}
      </div>
    </nav>
  );
}
