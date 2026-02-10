import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useTranslation } from "../i18n/useTranslation";
import Navbar from "../UI/Navbar";
import "../UIX/UserArea.css";

export default function UserArea() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profilo");
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [pagamenti, setPagamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const userId = sessionStorage.getItem("userId");

  const fetchData = useCallback(async () => {
    if (!userId) { navigate("/login"); return; }
    setLoading(true);
    const [userRes, prenoRes, vehRes, pagRes] = await Promise.all([
      supabase.from("Users").select("*").eq("id", userId).maybeSingle(),
      supabase.from("Prenotazioni").select("*").eq("cliente_id", userId).order("data_creazione", { ascending: false }),
      supabase.from("Vehicles").select("*"),
      supabase.from("pagamenti").select("*").eq("cliente_id", userId).order("data_creazione", { ascending: false }),
    ]);
    if (userRes.data) { setUser(userRes.data); setEditUser(userRes.data); }
    setPrenotazioni(prenoRes.data || []);
    setVehicles(vehRes.data || []);
    setPagamenti(pagRes.data || []);
    setLoading(false);
  }, [userId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true); setMsg({ type: "", text: "" });
    const { error } = await supabase.from("Users").update({ nome: editUser.nome, cognome: editUser.cognome, telefono: editUser.telefono, indirizzo: editUser.indirizzo }).eq("id", userId);
    if (error) { setMsg({ type: "error", text: t("userarea.saveError") }); }
    else { setUser(editUser); setEditing(false); setMsg({ type: "success", text: t("userarea.profileUpdated") }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); }
    setSaving(false);
  };

  const downloadContract = async (contratto_id) => {
    const path = `Contratti/${contratto_id}/contratto.pdf`;
    const { data, error } = await supabase.storage.from("Archivio").download(path);
    if (error) { alert(t("userarea.contractNotFound")); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a"); a.href = url; a.download = `contratto_${contratto_id}.pdf`; a.click(); URL.revokeObjectURL(url);
  };

  const getVehicle = (id) => vehicles.find((v) => v.id === id);
  const initials = user ? `${(user.nome || "")[0] || ""}${(user.cognome || "")[0] || ""}`.toUpperCase() : "";

  const tabs = [
    { key: "profilo", label: t("userarea.profile") },
    { key: "prenotazioni", label: t("userarea.bookings") },
    { key: "contratti", label: t("userarea.contracts") },
    { key: "pagamenti", label: t("userarea.payments") },
  ];

  if (loading) return (<><Navbar /><div className="userarea-wrapper"><div className="userarea-container"><p>{t("common.loading")}</p></div></div></>);

  return (
    <>
      <Navbar />
      <div className="userarea-wrapper">
        <div className="userarea-container">
          <div className="userarea-header">
            <div className="userarea-avatar">{initials}</div>
            <div className="userarea-header-info"><h1>{user?.nome} {user?.cognome}</h1><p>{user?.email}</p></div>
          </div>

          <div className="userarea-tabs">
            {tabs.map((tItem) => (
              <button key={tItem.key} className={`userarea-tab ${tab === tItem.key ? "active" : ""}`} onClick={() => setTab(tItem.key)}>{tItem.label}</button>
            ))}
          </div>

          <div className="userarea-panel">
            {tab === "profilo" && (
              <>
                {msg.text && <div className={msg.type === "success" ? "success-msg" : "error-msg"}>{msg.text}</div>}
                <div className="profile-form">
                  <div className="profile-field"><label>{t("userarea.firstName")}</label><input value={editUser?.nome || ""} disabled={!editing} onChange={(e) => setEditUser({ ...editUser, nome: e.target.value })} /></div>
                  <div className="profile-field"><label>{t("userarea.lastName")}</label><input value={editUser?.cognome || ""} disabled={!editing} onChange={(e) => setEditUser({ ...editUser, cognome: e.target.value })} /></div>
                  <div className="profile-field"><label>{t("userarea.email")}</label><input value={user?.email || ""} disabled /></div>
                  <div className="profile-field"><label>{t("userarea.phone")}</label><input value={editUser?.telefono || ""} disabled={!editing} onChange={(e) => setEditUser({ ...editUser, telefono: e.target.value })} /></div>
                  <div className="profile-field full"><label>{t("userarea.address")}</label><input value={editUser?.indirizzo || ""} disabled={!editing} onChange={(e) => setEditUser({ ...editUser, indirizzo: e.target.value })} /></div>
                  <div className="profile-actions">
                    {!editing ? (<button className="btn-save" onClick={() => setEditing(true)}>{t("userarea.editProfile")}</button>) : (
                      <><button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? t("userarea.saving") : t("userarea.save")}</button><button className="btn-cancel" onClick={() => { setEditing(false); setEditUser(user); }}>{t("userarea.cancel")}</button></>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === "prenotazioni" && (prenotazioni.length === 0 ? <div className="empty-state">{t("userarea.noBookings")}</div> : (
              <div style={{ overflowX: "auto" }}>
                <table className="userarea-table">
                  <thead><tr><th>{t("userarea.vehicle")}</th><th>{t("userarea.checkIn")}</th><th>{t("userarea.checkOut")}</th><th>{t("userarea.days")}</th><th>{t("userarea.total")}</th><th>{t("userarea.status")}</th></tr></thead>
                  <tbody>{prenotazioni.map((p) => { const v = getVehicle(p.veicolo_id); return (<tr key={p.id}><td>{v ? `${v.marca} ${v.modello}` : p.veicolo_id}</td><td>{new Date(p.check_in).toLocaleDateString("it-IT")}</td><td>{new Date(p.check_out).toLocaleDateString("it-IT")}</td><td>{p.giorni}</td><td>€{parseFloat(p.totale_pagato || 0).toFixed(2)}</td><td><span className={`status-badge ${p.stato}`}>{p.stato}</span></td></tr>); })}</tbody>
                </table>
              </div>
            ))}

            {tab === "contratti" && (() => {
              const withContract = prenotazioni.filter((p) => p.contratto_id && p.stato === "firmato");
              return withContract.length === 0 ? <div className="empty-state">{t("userarea.noContracts")}</div> : (
                <div style={{ overflowX: "auto" }}>
                  <table className="userarea-table">
                    <thead><tr><th>{t("userarea.vehicle")}</th><th>{t("userarea.period")}</th><th>{t("userarea.insuranceType")}</th><th>{t("userarea.total")}</th><th>{t("common.actions")}</th></tr></thead>
                    <tbody>{withContract.map((p) => { const v = getVehicle(p.veicolo_id); return (<tr key={p.id}><td>{v ? `${v.marca} ${v.modello}` : p.veicolo_id}</td><td>{new Date(p.check_in).toLocaleDateString("it-IT")} – {new Date(p.check_out).toLocaleDateString("it-IT")}</td><td>{p.assicurazione_tipo}</td><td>€{parseFloat(p.totale_pagato || 0).toFixed(2)}</td><td><button className="btn-download-sm" onClick={() => downloadContract(p.contratto_id)}>{t("userarea.downloadPdf")}</button></td></tr>); })}</tbody>
                  </table>
                </div>
              );
            })()}

            {tab === "pagamenti" && (pagamenti.length === 0 ? <div className="empty-state">{t("userarea.noPayments")}</div> : (
              <div style={{ overflowX: "auto" }}>
                <table className="userarea-table">
                  <thead><tr><th>{t("userarea.date")}</th><th>{t("userarea.amount")}</th><th>{t("userarea.method")}</th><th>{t("userarea.status")}</th></tr></thead>
                  <tbody>{pagamenti.map((p) => (<tr key={p.id}><td>{new Date(p.data_creazione).toLocaleDateString("it-IT")}</td><td>€{parseFloat(p.importo || 0).toFixed(2)}</td><td>{p.metodo || "—"}</td><td><span className={`status-badge ${(p.stato || "").replace(/\s/g, "-")}`}>{p.stato || "—"}</span></td></tr>))}</tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
