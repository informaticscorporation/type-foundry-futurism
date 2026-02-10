import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, CarFront, Gauge, Users, Fuel, Settings } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import "../UIX/Rent.css";
import { supabase } from "../supabaseClient";

function AnimatedSection({ children, from = "bottom", delay = 0.2 }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const transformMap = { bottom: "translateY(40px)", top: "translateY(-40px)", left: "translateX(-40px)", right: "translateX(40px)" };
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : transformMap[from], transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  );
}

export default function Rent() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      const { data, error } = await supabase.from("Vehicles").select("*").eq("id", id).single();
      if (!error) setCar(data);
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  if (loading) return <p className="rent-container">{t("common.loading")}</p>;
  if (!car) return (
    <div className="rent-container">
      <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
      <h2>{t("rent.vehicleNotFound")}</h2>
    </div>
  );

  const disponibile = !car.fuori_servizio && !car.inmanutenzione;

  return (
    <div className="rent-container">
      <div className="rent-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1><CarFront size={26} /> {car.marca} {car.modello}</h1>
      </div>
      <AnimatedSection>
        <div className="rent-card">
          <img src={car.immaggineauto} alt={`${car.marca} ${car.modello}`} className="rent-img" />
          <div className="rent-info">
            <h2>{car.marca} {car.modello}</h2>
            <p className="rent-category">{car.categoria}</p>
            <div className="rent-section">
              <h3>{t("rent.technicalDetails")}</h3>
              <div className="rent-details">
                <p><Gauge size={16} /> {t("rent.displacement")}: {car.cilindrata} cc</p>
                <p><Users size={16} /> {t("rent.doors")}: {car.porte}</p>
                <p><Fuel size={16} /> {t("rent.fuel")}: {car.alimentazione}</p>
                <p><Settings size={16} /> {t("rent.transmission")}: {car.cambio}</p>
                <p>{t("rent.mileage")}: {car.kmattuali} km</p>
                <p>{t("rent.color")}: {car.colore}</p>
              </div>
            </div>
            <p className="rent-price">€{car.prezzogiornaliero} {t("rents.perDay")}</p>
            <p className="rent-availability" style={{ color: disponibile ? "#00b894" : "#d63031" }}>
              {disponibile ? t("rents.isAvailable") : t("rents.isUnavailable")}
            </p>
            <button className={`rent-btn ${!disponibile ? "disabled" : ""}`} disabled={!disponibile} onClick={() => disponibile && navigate(`/prenotation/${id}`)}>
              {disponibile ? t("rent.bookNow") : t("rents.isUnavailable")}
            </button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
