import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays } from "date-fns";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../UIX/Booking.css";

export default function Pronotation() {
  const { id: veicolo_id } = useParams();
  
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [prenotazioneId, setPrenotazioneId] = useState(null);
  const [contrattoId, setContrattoId] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const signatureRef = useRef();

  const [range, setRange] = useState([{
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    key: "selection",
  }]);

  const [insurance, setInsurance] = useState("basic");
  const [airportDelivery, setAirportDelivery] = useState(false);
  const [extras, setExtras] = useState({ babySeat: false, snowChains: false });

  // Fetch vehicle
  useEffect(() => {
    const fetchVehicle = async () => {
      const { data, error } = await supabase
        .from("Vehicles")
        .select("*")
        .eq("id", veicolo_id)
        .single();
      if (!error) setVehicle(data);
    };
    fetchVehicle();
  }, [veicolo_id]);

  const toggleExtra = (key) => setExtras(p => ({ ...p, [key]: !p[key] }));

  const days = useMemo(() => {
    const d = differenceInDays(range[0].endDate, range[0].startDate);
    return d > 0 ? d : 1;
  }, [range]);

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
      id: prenotazione_id,
      contratto_id,
      cliente_id: sessionStorage.getItem("userId"),
      veicolo_id,
      check_in: range[0].startDate,
      check_out: range[0].endDate,
      giorni: days,
      prezzo_giornaliero: vehicle.prezzogiornaliero,
      totale_base: vehicle.prezzogiornaliero * days,
      assicurazione_tipo: insurance,
      totale_pagato: total,
      stato: "da_firmare",
      franchigia: vehicle.franchigia,
    });

    if (!error) {
      setPrenotazioneId(prenotazione_id);
      setContrattoId(contratto_id);
      setShowSignature(true);
      setStep(6);
    }
  };

  const handleSignContract = async () => {
    if (signatureRef.current.isEmpty()) return alert("La firma è obbligatoria");

    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Contratto di Noleggio Veicolo", 20, 20);
    pdf.setFontSize(11);
    pdf.text(`Contratto ID: ${contrattoId}`, 20, 35);
    pdf.text(`Veicolo: ${vehicle.marca} ${vehicle.modello}`, 20, 45);
    pdf.text(`Periodo: ${days} giorni`, 20, 55);
    pdf.text(`Totale: €${total}`, 20, 65);

    const signatureImage = signatureRef.current.getCanvas().toDataURL("image/png");
    pdf.text("Firma cliente:", 20, 90);
    pdf.addImage(signatureImage, "PNG", 20, 95, 90, 40);

    const pdfBlob = pdf.output("blob");
    const path = `Contratti/${contrattoId}/contratto_firmato.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("Archivio")
      .upload(path, pdfBlob, { contentType: "application/pdf", upsert: true });

    if (uploadError) return alert("Errore upload contratto");

    await supabase.from("Prenotazioni").update({ stato: "firmato" }).eq("id", prenotazioneId);
    alert("Contratto firmato e salvato correttamente ✅");

    navigate("/pagamento", { state: { prezzo_giornaliero: total, prenotazione_id: prenotazioneId ,userId: sessionStorage.getItem("userId"),veicolo_id: veicolo_id} });
  };

  if (!vehicle) return <p>Caricamento...</p>;

  return (
    <div className="booking-page">
      <div className="booking-container">

        {/* HEADER */}
        <div className="booking-header">
          <h2>{vehicle.marca} {vehicle.modello}</h2>
          <p>Step {step} di 6</p>
        </div>

        {/* STEP 1 - DATE */}
        {step === 1 && (
          <section className="step-section">
            <h3>1️⃣ Seleziona date</h3>
            <DateRange ranges={range} onChange={item => setRange([item.selection])} />
            <button className="btn-primary" onClick={() => setStep(2)}>Continua</button>
          </section>
        )}

        {/* STEP 2 - ASSICURAZIONE */}
        {step === 2 && (
          <section className="step-section">
            <h3>2️⃣ Assicurazione</h3>
            <div className="options-grid">
              {["basic", "comfort", "premium", "supertotal"].map(t => (
                <label className="option-item" key={t}>
                  <input type="radio" checked={insurance === t} onChange={() => setInsurance(t)} />
                  {t.toUpperCase()}
                </label>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setStep(3)}>Continua</button>
          </section>
        )}

        {/* STEP 3 - DELIVERY */}
        {step === 3 && (
          <section className="step-section">
            <label className="option-item">
              <input type="checkbox" checked={airportDelivery} onChange={() => setAirportDelivery(!airportDelivery)} />
              Consegna aeroporto (+20€)
            </label>
            <button className="btn-primary" onClick={() => setStep(4)}>Continua</button>
          </section>
        )}

        {/* STEP 4 - EXTRAS */}
        {step === 4 && (
          <section className="step-section">
            <h3>4️⃣ Extra</h3>
            <div className="options-grid">
              <label className="option-item">
                <input type="checkbox" checked={extras.babySeat} onChange={() => toggleExtra("babySeat")} />
                Seggiolino (+8€/giorno)
              </label>
              <label className="option-item">
                <input type="checkbox" checked={extras.snowChains} onChange={() => toggleExtra("snowChains")} />
                Catene neve (+5€/giorno)
              </label>
            </div>
            <button className="btn-primary" onClick={() => setStep(5)}>Continua</button>
          </section>
        )}

        {/* STEP 5 - RIEPILOGO */}
        {step === 5 && (
          <section className="step-section">
            <h3>5️⃣ Riepilogo</h3>
            <p>Giorni: {days}</p>
            <p>Totale: €{total}</p>
            <button className="btn-primary" onClick={handleConfirmBooking}>Conferma e firma contratto</button>
          </section>
        )}

        {/* STEP 6 - FIRMA */}
        {showSignature && (
          <section className="step-section signature-section">
            <h3>✍️ Firma contratto</h3>
            <SignatureCanvas ref={signatureRef} penColor="black" canvasProps={{ className: "signature-canvas" }} />
            <div className="signature-actions">
              <button className="btn-outline" onClick={() => signatureRef.current.clear()}>Cancella</button>
              <button className="btn-primary" onClick={handleSignContract}>Firma e salva contratto</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
