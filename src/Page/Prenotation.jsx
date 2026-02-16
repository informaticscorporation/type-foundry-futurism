import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays, format } from "date-fns";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "../i18n/useTranslation";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../UIX/Booking.css";

export default function Pronotation() {
  const { t } = useTranslation();
  const { id: veicolo_id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [prenotazioneId, setPrenotazioneId] = useState(null);
  const [contrattoId, setContrattoId] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const signatureRef = useRef();
  const [range, setRange] = useState([{ startDate: new Date(), endDate: addDays(new Date(), 1), key: "selection" }]);
  const [insurance, setInsurance] = useState("basic");
  const [airportDelivery, setAirportDelivery] = useState(false);
  const [extras, setExtras] = useState({ babySeat: false, snowChains: false });

  useEffect(() => {
    const fetchVehicle = async () => {
      const { data, error } = await supabase.from("Vehicles").select("*").eq("id", veicolo_id).single();
      if (!error) setVehicle(data);
    };
    fetchVehicle();
  }, [veicolo_id]);

  const toggleExtra = (key) => setExtras(p => ({ ...p, [key]: !p[key] }));
  const days = useMemo(() => { const d = differenceInDays(range[0].endDate, range[0].startDate); return d > 0 ? d : 1; }, [range]);
  const total = useMemo(() => {
    if (!vehicle) return 0;
    let price = vehicle.prezzogiornaliero * days;
    price += (vehicle[`assicurazione${insurance}`] || 0) * days;
    if (airportDelivery) price += 20;
    if (extras.babySeat) price += 8 * days;
    if (extras.snowChains) price += 5 * days;
    return price;
  }, [vehicle, days, insurance, airportDelivery, extras]);

  const handleConfirmBooking = async () => {
    const contratto_id = uuidv4();
    const prenotazione_id = uuidv4();
    const { error } = await supabase.from("Prenotazioni").insert({
      id: prenotazione_id, contratto_id, cliente_id: sessionStorage.getItem("userId"), veicolo_id,
      check_in: range[0].startDate, check_out: range[0].endDate, giorni: days,
      prezzo_giornaliero: vehicle.prezzogiornaliero, totale_base: vehicle.prezzogiornaliero * days,
      assicurazione_tipo: insurance, totale_pagato: total, stato: "da_firmare", franchigia: vehicle.franchigia,
    });
    if (!error) {
      setPrenotazioneId(prenotazione_id);
      setContrattoId(contratto_id);
      setStep(6); // contract preview
    } else {
      toast.error(t("paymentFlow.genericError"));
    }
  };

  const handleProceedToSign = () => {
    setShowSignature(true);
    setStep(7);
  };

  const handleSignContract = async () => {
    if (signatureRef.current.isEmpty()) {
      toast.warning(t("booking.signatureRequired"));
      return;
    }
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(t("contratti.rentalContract"), 20, 20);
    pdf.setFontSize(11);
    pdf.text(`${t("contratti.contractId")}: ${contrattoId}`, 20, 35);
    pdf.text(`${t("contratti.vehicle")}: ${vehicle.marca} ${vehicle.modello}`, 20, 45);
    pdf.text(`${t("booking.days")}: ${days}`, 20, 55);
    pdf.text(`${t("booking.total")}: €${total}`, 20, 65);
    const signatureImage = signatureRef.current.getCanvas().toDataURL("image/png");
    pdf.text(`${t("contratti.clientSignature")}:`, 20, 90);
    pdf.addImage(signatureImage, "PNG", 20, 95, 90, 40);
    const pdfBlob = pdf.output("blob");
    const path = `Contratti/${contrattoId}/contratto_firmato.pdf`;
    const { error: uploadError } = await supabase.storage.from("Archivio").upload(path, pdfBlob, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      toast.error(t("booking.uploadError"));
      return;
    }
    await supabase.from("Prenotazioni").update({ stato: "firmato" }).eq("id", prenotazioneId);
    toast.success(t("booking.contractSigned"));
    navigate("/pagamento", { state: { prezzo_giornaliero: total, prenotazione_id: prenotazioneId, userId: sessionStorage.getItem("userId"), veicolo_id } });
  };

  if (!vehicle) return <p>{t("common.loading")}</p>;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h2>{vehicle.marca} {vehicle.modello}</h2>
          <p>Step {step} / 7</p>
        </div>
        {step === 1 && (<section className="step-section"><h3>{t("booking.selectDates")}</h3><DateRange ranges={range} onChange={item => setRange([item.selection])} /><button className="btn-primary" onClick={() => setStep(2)}>{t("common.continue")}</button></section>)}
        {step === 2 && (<section className="step-section"><h3>{t("booking.insurance")}</h3><div className="options-grid">{["basic", "comfort", "premium", "supertotal"].map(tIns => (<label className="option-item" key={tIns}><input type="radio" checked={insurance === tIns} onChange={() => setInsurance(tIns)} />{tIns.toUpperCase()}</label>))}</div><button className="btn-primary" onClick={() => setStep(3)}>{t("common.continue")}</button></section>)}
        {step === 3 && (<section className="step-section"><label className="option-item"><input type="checkbox" checked={airportDelivery} onChange={() => setAirportDelivery(!airportDelivery)} />{t("booking.airportDelivery")}</label><button className="btn-primary" onClick={() => setStep(4)}>{t("common.continue")}</button></section>)}
        {step === 4 && (<section className="step-section"><h3>{t("booking.extras")}</h3><div className="options-grid"><label className="option-item"><input type="checkbox" checked={extras.babySeat} onChange={() => toggleExtra("babySeat")} />{t("booking.babySeat")}</label><label className="option-item"><input type="checkbox" checked={extras.snowChains} onChange={() => toggleExtra("snowChains")} />{t("booking.snowChains")}</label></div><button className="btn-primary" onClick={() => setStep(5)}>{t("common.continue")}</button></section>)}
        {step === 5 && (<section className="step-section"><h3>{t("booking.summary")}</h3><p>{t("booking.days")}: {days}</p><p>{t("booking.total")}: €{total}</p><button className="btn-primary" onClick={handleConfirmBooking}>{t("booking.confirmAndSign")}</button></section>)}

        {/* Step 6: Contract Preview */}
        {step === 6 && (
          <section className="step-section contract-preview-section">
            <h3>{t("booking.readContract")}</h3>
            <div className="contract-preview-box">
              <h4>{t("contratti.rentalContractFull")}</h4>
              <div className="contract-detail-row"><strong>{t("contratti.contractId")}:</strong> <span>{contrattoId}</span></div>
              <div className="contract-detail-row"><strong>{t("contratti.creationDate")}:</strong> <span>{format(new Date(), "dd/MM/yyyy")}</span></div>
              <hr />
              <h5>{t("contratti.vehicleData")}</h5>
              <div className="contract-detail-row"><strong>{t("contratti.vehicle")}:</strong> <span>{vehicle.marca} {vehicle.modello}</span></div>
              <div className="contract-detail-row"><strong>{t("rent.color")}:</strong> <span>{vehicle.colore || "-"}</span></div>
              <hr />
              <h5>{t("contratti.rentalDetails")}</h5>
              <div className="contract-detail-row"><strong>{t("booking.days")}:</strong> <span>{days}</span></div>
              <div className="contract-detail-row"><strong>Check-in:</strong> <span>{format(range[0].startDate, "dd/MM/yyyy")}</span></div>
              <div className="contract-detail-row"><strong>Check-out:</strong> <span>{format(range[0].endDate, "dd/MM/yyyy")}</span></div>
              <div className="contract-detail-row"><strong>{t("booking.insurance")}:</strong> <span>{insurance.toUpperCase()}</span></div>
              {airportDelivery && <div className="contract-detail-row"><strong>{t("booking.airportDelivery")}:</strong> <span>✓</span></div>}
              {extras.babySeat && <div className="contract-detail-row"><strong>{t("booking.babySeat")}:</strong> <span>✓</span></div>}
              {extras.snowChains && <div className="contract-detail-row"><strong>{t("booking.snowChains")}:</strong> <span>✓</span></div>}
              <hr />
              <div className="contract-detail-row contract-total"><strong>{t("booking.total")}:</strong> <span>€{total}</span></div>
              <p className="contract-terms-text">{t("booking.contractTermsText")}</p>
            </div>
            <button className="btn-primary" onClick={handleProceedToSign}>{t("booking.proceedToSign")}</button>
          </section>
        )}

        {/* Step 7: Signature */}
        {showSignature && step === 7 && (
          <section className="step-section signature-section">
            <h3>{t("booking.signContract")}</h3>
            <SignatureCanvas ref={signatureRef} penColor="black" canvasProps={{ className: "signature-canvas" }} />
            <div className="signature-actions">
              <button className="btn-outline" onClick={() => signatureRef.current.clear()}>{t("booking.clear")}</button>
              <button className="btn-primary" onClick={handleSignContract}>{t("booking.signAndSave")}</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
