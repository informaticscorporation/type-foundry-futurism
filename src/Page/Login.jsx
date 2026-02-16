import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";
import { useTranslation } from "../i18n/useTranslation";
import "../UIX/Login.css";

function Animation({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("show"); }); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="fade-up">{children}</div>;
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { toast.warning(t("login.enterCredentials")); return; }
    setLoading(true);
    setErrorMsg("");
    try {
      const { data: userData, error } = await supabase
        .from("Users").select("*").eq("email", email.toLowerCase()).eq("password_hash", password).single();
      if (error || !userData) { toast.error(t("login.invalidCredentials")); return; }
      if (userData.TipoUtente === "Admin") {
        sessionStorage.setItem("userId", userData.id);
        sessionStorage.setItem("admin", true);
        navigate("/dashboard");
      } else {
        sessionStorage.setItem("userId", userData.id);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Login failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-container">
      <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} color="white" /></button>
      <div className="login-left">
        <Animation>
          <h1 className="logo">{t("login.createAccount")}</h1>
          <p className="subtitle">{t("login.registerSubtitle")}</p>
          <button className="sign-btn" onClick={() => navigate("/register")}>{t("login.signUp")}</button>
        </Animation>
      </div>
      <div className="login-right">
        <Animation>
          <h2 className="title">{t("login.helloAgain")}</h2>
          <p className="welcome">{t("login.welcomeBack")}</p>
          <div className="form">
            {errorMsg && <div className="err">{errorMsg}</div>}
            <div className="input-box">
              <Mail className="icon" />
              <input type="email" placeholder={t("login.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-box">
              <Lock className="icon" />
              <input type="password" placeholder={t("login.password")} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="sign-up" onClick={handleLogin} disabled={loading}>
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
            <a href="#" className="forgot">{t("login.forgotPassword")}</a>
          </div>
        </Animation>
      </div>
    </div>
  );
}
