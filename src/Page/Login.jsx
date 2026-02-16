import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";
import { useTranslation } from "../i18n/useTranslation";
import "../UIX/Login.css";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.warning(t("login.enterCredentials")); return; }
    setLoading(true);
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
      toast.error(err.message || "Login failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <button className="login-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} color="#fff" />
      </button>

      <div className="login-left">
        <h1>{t("login.createAccount")}</h1>
        <p>{t("login.registerSubtitle")}</p>
        <button className="signup-btn" onClick={() => navigate("/register")}>{t("login.signUp")}</button>
      </div>

      <div className="login-right">
        <div className="login-card login-fade-in">
          <h2>{t("login.helloAgain")}</h2>
          <p className="login-subtitle">{t("login.welcomeBack")}</p>

          <div className="login-form">
            <div className="login-field">
              <label>Email</label>
              <div className="login-input-wrap">
                <Mail size={18} className="icon" />
                <input type="email" placeholder={t("login.email")} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <Lock size={18} className="icon" />
                <input type="password" placeholder={t("login.password")} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            </div>

            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>

            <a href="#" className="login-forgot">{t("login.forgotPassword")}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
