import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";
import "../UIX/Login.css";

function Animation({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="fade-up">{children}</div>;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Controllo direttamente nella tabella Users
      const { data: userData, error } = await supabase
        .from("Users")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("password_hash", password)
        .single();

      if (error || !userData) {
        setErrorMsg("Invalid email or password.");
        return;
      }

      // Redirect in base al TipoUtente
      if (userData.TipoUtente === "Admin") {
        sessionStorage.setItem("userId", userData.id);
        sessionStorage.setItem("admin", true);
        navigate("/dashboard");
      } else if (userData.tipoUtente === "Cliente") {
        sessionStorage.setItem("userId", userData.id);
        navigate("/");
      } else {
        navigate("/"); // fallback
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
       <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color="white" />
        </button>
      <div className="login-left">

        <Animation>
          <h1 className="logo">Create Your Account</h1>
          <p className="subtitle">Register now and manage your car rentals with ease.</p>
          <button className="sign-btn" onClick={() => navigate("/register")}>Sign Up</button>
        </Animation>
      </div>

      <div className="login-right">
        <Animation>
          <h2 className="title">Hello Again!</h2>
          <p className="welcome">Welcome Back</p>

          <div className="form">
            {errorMsg && <div className="err">{errorMsg}</div>}

            <div className="input-box">
              <Mail className="icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-box">
              <Lock className="icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="sign-up"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <a href="#" className="forgot">Forgot Password</a>
          </div>
        </Animation>
      </div>
    </div>
  );
}
