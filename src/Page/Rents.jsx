import { useState, useEffect, useRef } from "react";
import { Filter, Car, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../UIX/Rents.css";
import { supabase } from "../supabaseClient";

/* --- COMPONENTE ANIMAZIONE --- */
function AnimatedCard({ children, index = 0, from = "bottom", delay = 0.2 }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transformMap = {
    bottom: "translateY(30px)",
    top: "translateY(-30px)",
    left: "translateX(-30px)",
    right: "translateX(30px)",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transformMap[from],
        transition: `opacity 0.6s ease ${index * delay}s, transform 0.6s ease ${
          index * delay
        }s`,
      }}
    >
      {children}
    </div>
  );
}

/* --- COMPONENTE PRINCIPALE --- */
export default function Rents() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    name: "",
    price: "",
    category: "",
    available: "",
  });

  /* -------- Fetch Supabase -------- */
  useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase
        .from("Vehicles")
        .select(`
          id,
          marca,
          modello,
          categoria,
          prezzogiornaliero,
          immaggineauto,
          fuori_servizio,
          inmanutenzione
        `)
        .order("datacreazione", { ascending: false });

      if (error) {
        console.error(error);
        setCars([]);
      } else {
        const normalized = (data || []).map((v) => ({
          ...v,
          disponibile: v.fuori_servizio === false && v.inmanutenzione === false,
        }));
        setCars(normalized);
      }

      setLoading(false);
    };

    fetchCars();
  }, []);

  /* -------- Filtri -------- */
  const filteredCars = cars.filter((car) => {
    const fullName = `${car.marca} ${car.modello}`.toLowerCase();

    return (
      (filters.name === "" ||
        fullName.includes(filters.name.toLowerCase())) &&
      (filters.price === "" ||
        String(car.prezzogiornaliero || "").includes(filters.price)) &&
      (filters.category === "" ||
        car.categoria?.toLowerCase().includes(filters.category.toLowerCase())) &&
      (filters.available === "" ||
        (filters.available === "yes" && car.disponibile) ||
        (filters.available === "no" && !car.disponibile))
    );
  });

  return (
    <div className="rents-container">
      {/* Header */}
      <div className="rents-header">
        <div className="rents-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1>
            <Car size={26} /> Auto disponibili
          </h1>
        </div>

        <button className="filter-btn" onClick={() => setShowFilter(!showFilter)}>
          {showFilter ? (
            <X className="close-filter" size={18} color="green" />
          ) : (
            <Filter size={18} color="green" />
          )}
          {showFilter ? "Chiudi Filtri" : "Filtra"}
        </button>
      </div>

      {/* Filtri */}
      {showFilter && (
        <div className="filters">
          <div className="filter-group">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Cerca per nome"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Prezzo</label>
            <input
              type="text"
              placeholder="es. 100"
              value={filters.price}
              onChange={(e) => setFilters({ ...filters, price: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Categoria</label>
            <input
              type="text"
              placeholder="SUV, Sportiva..."
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Disponibilità</label>
            <select
              value={filters.available}
              onChange={(e) =>
                setFilters({ ...filters, available: e.target.value })
              }
            >
              <option value="">Tutte</option>
              <option value="yes">Disponibili</option>
              <option value="no">Non disponibili</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista Auto */}
      <div className="cars-grid">
        {loading && <p>Loading...</p>}

        {!loading &&
          filteredCars.map((car, i) => (
            <AnimatedCard
              key={car.id}
              index={i}
              from={i % 2 === 0 ? "left" : "right"}
            >
              <div
                className="car-card"
                onClick={() => navigate(`/rents/${car.id}`)}
              >
                <img
                  className="car-image"
                  src={car.immaggineauto || "/placeholder-car.webp"}
                  alt={`${car.marca} ${car.modello}`}
                />
                <div className="car-info">
                  <h3>
                    {car.marca} {car.modello}
                  </h3>
                  <p className="price">€ {car.prezzogiornaliero} / giorno</p>
                  <p
                    className="availability"
                    style={{
                      color: car.disponibile ? "#00b894" : "#d63031",
                      fontWeight: 600,
                      marginTop: "6px",
                    }}
                  >
                    {car.disponibile ? "Disponibile" : "Non disponibile"}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          ))}

        {!loading && filteredCars.length === 0 && (
          <p className="no-results">Nessuna auto trovata 😔</p>
        )}
      </div>
    </div>
  );
}
