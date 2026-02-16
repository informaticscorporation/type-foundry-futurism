import { useRef, useState } from "react";
import { Mail, Lock, User, Smartphone, FileText, Calendar, Eye, EyeOff, MapPin, Hash, ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useTranslation } from "../i18n/useTranslation";
import { toast } from "sonner";
import "../UIX/Register.css";

const TOTAL_STEPS = 10;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [hasPiva, setHasPiva] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    nome: "", cognome: "", email: "", telefono: "",
    password: "", confirm: "", data_nascita: "",
    indirizzo: "", citta: "", cap: "", codice_fiscale: "",
    piva: "", business: "",
  });

  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({
    idFront: null, idBack: null,
    licenseFront: null, licenseBack: null,
    taxFront: null, taxBack: null,
  });

  const documentSteps = [
    { key: "idFront", label: t("register.idCardFront"), icon: <FileText size={20} /> },
    { key: "idBack", label: t("register.idCardBack"), icon: <FileText size={20} /> },
    { key: "licenseFront", label: t("register.licenseFront"), icon: <FileText size={20} /> },
    { key: "licenseBack", label: t("register.licenseBack"), icon: <FileText size={20} /> },
    { key: "taxFront", label: t("register.taxCardFront"), icon: <FileText size={20} /> },
    { key: "taxBack", label: t("register.taxCardBack"), icon: <FileText size={20} /> },
  ];

  const handleFileUpload = (key, file) => setFiles(prev => ({ ...prev, [key]: file }));
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const next = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.nome) newErrors.nome = t("common.required");
      if (!form.cognome) newErrors.cognome = t("common.required");
      if (!form.email.includes("@")) newErrors.email = t("register.invalidEmail");
    }
    if (step === 2) {
      if (!form.indirizzo) newErrors.indirizzo = t("common.required");
      if (!form.citta) newErrors.citta = t("common.required");
      if (!form.cap) newErrors.cap = t("common.required");
      if (!form.codice_fiscale) newErrors.codice_fiscale = t("common.required");
    }
    if (step === 3) {
      if (!form.password || form.password.length < 6) newErrors.password = t("register.minChars");
      if (form.password !== form.confirm) newErrors.confirm = t("register.passwordsMismatch");
    }
    if (step >= 4 && step <= 9) {
      const currentDoc = documentSteps[step - 4];
      if (!files[currentDoc.key]) newErrors[currentDoc.key] = t("common.required");
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  const handleRegister = async () => {
    if (!acceptedTerms) {
      toast.error(t("register.mustAcceptTerms"));
      return;
    }
    setLoading(true);
    try {
      const { data: userData, error } = await supabase.from("Users").insert([{
        nome: form.nome, cognome: form.cognome, email: form.email,
        telefono: form.telefono, tipoUtente: "Cliente", password_hash: form.password,
        partita_iva: hasPiva ? form.piva : null, ragione_sociale: hasPiva ? form.business : null,
        data_nascita: form.data_nascita || null, indirizzo: form.indirizzo || null,
        citta: form.citta || null, cap: form.cap || null, codice_fiscale: form.codice_fiscale || null,
      }]).select().single();
      if (error) throw error;
      const userId = userData.id;

      const colMap = { idFront: "idCARDFrontimg", idBack: "idCARDBackimg", licenseFront: "patenteFront", licenseBack: "patenteBack", taxFront: "taxiCardFront", taxBack: "taxiCardBack" };
      const fileNameMap = { idFront: "idcardfront", idBack: "idcardback", licenseFront: "licensefront", licenseBack: "licenseback", taxFront: "taxfront", taxBack: "taxback" };

      for (const [key, file] of Object.entries(files)) {
        if (!file) continue;
        const ext = file.name.split(".").pop();
        const filePath = `documenti_utente/${userId}/${fileNameMap[key]}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("Archivio").upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from("Archivio").getPublicUrl(filePath);
        await supabase.from("Users").update({ [colMap[key]]: publicUrlData.publicUrl }).eq("id", userId);
      }

      toast.success(t("register.successMsg"));
      setSuccessMessage(t("register.successMsg"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({ docKey, label }) => {
    const inputRef = useRef(null);
    return (
      <div className="reg-field">
        <label>{label}</label>
        <div className="doc-upload-area" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(docKey, e.target.files[0])} />
          {files[docKey] ? (
            files[docKey].type.startsWith("image/") ? (
              <img src={URL.createObjectURL(files[docKey])} alt="preview" className="doc-preview-img" />
            ) : <p>{t("register.pdfSelected")}</p>
          ) : (
            <>
              <Upload size={28} color="#94a3b8" />
              <p className="upload-label">{label}</p>
              <p className="upload-hint">PNG, JPG, PDF</p>
            </>
          )}
        </div>
        {errors[docKey] && <span className="reg-error">{errors[docKey]}</span>}
      </div>
    );
  };

  const renderStep = () => {
    if (step === 1) return (
      <div className="register-form reg-step-enter">
        <div className="reg-field">
          <label>{t("register.firstName")}</label>
          <div className="reg-input-wrap"><User size={18} className="icon" /><input value={form.nome} onChange={e => update("nome", e.target.value)} placeholder={t("register.firstName")} /></div>
          {errors.nome && <span className="reg-error">{errors.nome}</span>}
        </div>
        <div className="reg-field">
          <label>{t("register.lastName")}</label>
          <div className="reg-input-wrap"><User size={18} className="icon" /><input value={form.cognome} onChange={e => update("cognome", e.target.value)} placeholder={t("register.lastName")} /></div>
          {errors.cognome && <span className="reg-error">{errors.cognome}</span>}
        </div>
        <div className="reg-field">
          <label>Email</label>
          <div className="reg-input-wrap"><Mail size={18} className="icon" /><input value={form.email} onChange={e => update("email", e.target.value)} placeholder="Email" /></div>
          {errors.email && <span className="reg-error">{errors.email}</span>}
        </div>
        <div className="reg-field">
          <label>{t("register.phone")}</label>
          <div className="reg-input-wrap"><Smartphone size={18} className="icon" /><input value={form.telefono} onChange={e => update("telefono", e.target.value)} placeholder={t("register.phone")} /></div>
        </div>
        <div className="reg-nav"><button className="reg-btn-next" onClick={next}>{t("common.next")}</button></div>
      </div>
    );

    if (step === 2) return (
      <div className="register-form reg-step-enter">
        <div className="reg-field">
          <label>{t("register.address")}</label>
          <div className="reg-input-wrap"><MapPin size={18} className="icon" /><input value={form.indirizzo} onChange={e => update("indirizzo", e.target.value)} placeholder={t("register.address")} /></div>
          {errors.indirizzo && <span className="reg-error">{errors.indirizzo}</span>}
        </div>
        <div className="reg-field">
          <label>{t("register.city")}</label>
          <div className="reg-input-wrap"><MapPin size={18} className="icon" /><input value={form.citta} onChange={e => update("citta", e.target.value)} placeholder={t("register.city")} /></div>
          {errors.citta && <span className="reg-error">{errors.citta}</span>}
        </div>
        <div className="reg-field">
          <label>{t("register.zip")}</label>
          <div className="reg-input-wrap"><Hash size={18} className="icon" /><input value={form.cap} onChange={e => update("cap", e.target.value)} placeholder={t("register.zip")} /></div>
          {errors.cap && <span className="reg-error">{errors.cap}</span>}
        </div>
        <div className="reg-field">
          <label>{t("register.taxCode")}</label>
          <div className="reg-input-wrap"><Hash size={18} className="icon" /><input value={form.codice_fiscale} onChange={e => update("codice_fiscale", e.target.value)} placeholder={t("register.taxCode")} /></div>
          {errors.codice_fiscale && <span className="reg-error">{errors.codice_fiscale}</span>}
        </div>
        <div className="reg-nav">
          <button className="reg-btn-back" onClick={back}>{t("common.back")}</button>
          <button className="reg-btn-next" onClick={next}>{t("common.next")}</button>
        </div>
      </div>
    );

    if (step === 3) return (
      <div className="register-form reg-step-enter">
        <div className="reg-field">
          <label>{t("register.birthDate")}</label>
          <div className="reg-input-wrap"><Calendar size={18} className="icon" /><input type="date" value={form.data_nascita} onChange={e => update("data_nascita", e.target.value)} /></div>
        </div>
        <div className="reg-field">
          <label>Password</label>
          <div className="reg-input-wrap">
            <Lock size={18} className="icon" />
            <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Password" />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="reg-error">{errors.password}</span>}
        </div>
        <div className="reg-field">
          <label>{t("register.confirmPassword")}</label>
          <div className="reg-input-wrap">
            <Lock size={18} className="icon" />
            <input type={showConfirmPassword ? "text" : "password"} value={form.confirm} onChange={e => update("confirm", e.target.value)} placeholder={t("register.confirmPassword")} />
            <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirm && <span className="reg-error">{errors.confirm}</span>}
        </div>
        <div className="reg-nav">
          <button className="reg-btn-back" onClick={back}>{t("common.back")}</button>
          <button className="reg-btn-next" onClick={next}>{t("common.next")}</button>
        </div>
      </div>
    );

    if (step >= 4 && step <= 9) {
      const currentDoc = documentSteps[step - 4];
      return (
        <div className="register-form reg-step-enter">
          <FileUploadBox docKey={currentDoc.key} label={currentDoc.label} />
          <div className="reg-nav">
            <button className="reg-btn-back" onClick={back}>{t("common.back")}</button>
            <button className="reg-btn-next" onClick={next}>{t("common.next")}</button>
          </div>
        </div>
      );
    }

    if (step === 10) return (
      <div className="register-form reg-step-enter">
        <div className="reg-checkbox">
          <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
          <label>{t("register.acceptTerms")}</label>
        </div>
        <div className="reg-checkbox">
          <input type="checkbox" onChange={e => setHasPiva(e.target.checked)} />
          <label>{t("register.hasVAT")}</label>
        </div>
        {hasPiva && (
          <>
            <div className="reg-field">
              <label>{t("register.vatNumber")}</label>
              <div className="reg-input-wrap"><input value={form.piva} onChange={e => update("piva", e.target.value)} placeholder={t("register.vatNumber")} /></div>
            </div>
            <div className="reg-field">
              <label>{t("register.businessName")}</label>
              <div className="reg-input-wrap"><input value={form.business} onChange={e => update("business", e.target.value)} placeholder={t("register.businessName")} /></div>
            </div>
          </>
        )}
        <div className="reg-nav">
          <button className="reg-btn-back" onClick={back}>{t("common.back")}</button>
          <button className="reg-btn-next" onClick={handleRegister} disabled={!acceptedTerms || loading}>
            {loading ? t("register.registering") : t("register.registerBtn")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="register-page">
      <button className="register-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} color="#fff" />
      </button>

      <div className="register-left">
        <h1>{t("register.welcome")}</h1>
        <p>{t("register.alreadyAccount")}</p>
        <button className="signin-btn" onClick={() => navigate("/login")}>{t("register.signIn")}</button>
      </div>

      <div className="register-right">
        <div className="register-card">
          <h2>{t("register.createYourAccount")}</h2>
          <p className="register-step-label">{t("register.step")} {step} {t("register.of")} {TOTAL_STEPS}</p>

          <div className="register-stepper">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={`stepper-dot ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`} />
            ))}
          </div>

          {successMessage && <div className="reg-success">{successMessage}</div>}
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
