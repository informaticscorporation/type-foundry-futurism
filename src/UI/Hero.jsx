import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, CalendarDays, Heart, Smartphone, ShieldCheck, DollarSign, CreditCard } from "lucide-react";
import { supabase } from "../supabaseClient";

import "../UIX/Hero.css";
import logo from "../assets/logo.webp";

export default function Hero({ menuOpen, setMenuOpen }) {
  const [carCollection, setCarCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const closeMenu = () => setMenuOpen(false);
  const navigate = useNavigate();
  sessionStorage.setItem("Loading", false);

  const brands = [
    { name: "BMW", src: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg" },
    { name: "Audi", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/1199px-Audi-Logo_2016.svg.png" },
    { name: "Tesla", src: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" },
    { name: "Ford", src: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg" },
    { name: "Mercedes", src: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg" },
    { name: "Kia", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.png/1200px-Kia-logo.png" },
  ];

  const bodyTypes = [
    { name: "SUV", icon: <Car size={35} /> },
    { name: "Sedan", icon: <Car size={35} /> },
    { name: "Coupe", icon: <Car size={35} /> },
    { name: "Convertible", icon: <Car size={35} /> },
    { name: "Hatchback", icon: <Car size={35} /> },
    { name: "Sport", icon: <Car size={35} /> },
    { name: "Electric", icon: <Car size={35} /> },
    { name: "Hybrid", icon: <Car size={35} /> },
  ];

  // Fetch car collection from Supabase
   useEffect(() => {
    const fetchCars = async () => {
      const { data, error } = await supabase
        .from("Vehicles")
        .select(`
          id,
          marca,
          modello,
          categoria,
          immaggineauto,
          prezzogiornaliero,
          alimentazione,
          cambio,
          porte,
          datacreazione
        `)
        .order("datacreazione", { ascending: false });

      if (error) console.error(error);
      else setCarCollection(data || []);
    };
    fetchCars();
  }, []);
  // --- Preloader globale ---
 useEffect(() => {
    const hasLoaded = sessionStorage.getItem("Loading") === "true";

    if (!hasLoaded) {
      const images = [
        "https://pngimg.com/d/bmw_PNG99543.png",
        ...brands.map(b => b.src),
        ...carCollection.map(c => c.immaggineauto).filter(Boolean),
      ];

      if (!images.length) {
        setLoading(false);
        return;
      }

      let loaded = 0;
      images.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => {
          if (++loaded === images.length) {
            setLoading(false);
            sessionStorage.setItem("Loading", "true");
          }
        };
      });
    } else setLoading(false);
  }, [carCollection]);


  // --- COMPONENTE ANIMAZIONE ---
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
          transform: visible ? "translateX(0) translateY(0)" : transformMap[from],
          transition: `opacity 0.6s ease ${index * delay}s, transform 0.6s ease ${index * delay}s`,
        }}
      >
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <img src={logo} alt="logo" />
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="hero-container">
      {/* MENU SLIDE */}
      <div className={`menu-popup ${menuOpen ? "show" : ""}`}>
        <ul>
          <li translate="no" onClick={() => { closeMenu(); navigate("/"); }}>Home</li>
          <li translate="no" onClick={() => { closeMenu(); navigate("/rents"); }}>Rents</li>
        </ul>
      </div>

      <div className="separatore"></div>

      {/* HERO */}
      <section className="hero-wrapper">
        <AnimatedCard index={0} from="top">
          <h1 className="hero-title">
            Discover the world on wheels <br />
            with our <span className="highlight">luxury car rental</span>
          </h1>
        </AnimatedCard>

        <AnimatedCard index={1} from="bottom">
          <div className="hero-image">
            <img src="https://pngimg.com/d/bmw_PNG99543.png" alt="Car" />
          </div>
        </AnimatedCard>

        <AnimatedCard index={2} from="bottom">
          <div className="hero-search">
            <div className="search-grid">
              <div className="search-item">
                <label><MapPin size={16} /> Pick-up Location</label>
                <input type="text" placeholder="Search a location" />
              </div>
              <div className="search-item">
                <label><CalendarDays size={16} /> Pick-up Date</label>
                <input type="date" />
              </div>
              <div className="search-item">
                <label><MapPin size={16} /> Drop-off Location</label>
                <input type="text" placeholder="Search a location" />
              </div>
              <div className="search-item">
                <label><CalendarDays size={16} /> Drop-off Date</label>
                <input type="date" />
              </div>
              <button className="find-btn">Find a Vehicle</button>
            </div>
          </div>
        </AnimatedCard>
      </section>

      {/* BRANDS */}
      <section className="brands-section">
        <AnimatedCard index={0} from="left">
          <h2>Rent by Brands</h2>
        </AnimatedCard>
        <div className="brands-grid">
          {brands.map((b, idx) => (
            <AnimatedCard key={b.name} index={idx + 1} from="bottom">
              <div className="brand-card">
                <img src={b.src} alt={b.name} width={35} />
                <p>{b.name}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* BODY TYPES */}
      <section className="bodytype-section">
        <AnimatedCard index={0} from="left">
          <h2>Rent by Body Type</h2>
        </AnimatedCard>
        <div className="bodytype-grid">
          {bodyTypes.map((t, idx) => (
            <AnimatedCard key={t.name} index={idx + 1} from="bottom">
              <div className="bodytype-card">
                {t.icon}
                <p>{t.name}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* CAR COLLECTION */}
      <section className="collection-section">
        <AnimatedCard index={0} from="left">
          <h2 className="collection-title">Our Impressive Collection of Cars</h2>
          <p className="collection-subtitle">
            Ranging from elegant sedans to powerful sports cars, all carefully selected to provide our
            customers with the ultimate driving experience.
          </p>
        </AnimatedCard>

        <div className="collection-filters" translate="no">
          {["City Car", "Small Car", "Compact/Berline", "SUV/Crossover", "Vans", "9 seater", "Scooter 125cc", "Scooter 150cc"].map((filter, idx) => (
            <AnimatedCard key={filter} index={idx + 1} from="bottom" translate>
              <button className="filter-btn">{filter}</button>
            </AnimatedCard>
          ))}
        </div>

        <div className="car-grid">
          {carCollection.map((car, idx) => (
            <AnimatedCard key={car.id} index={idx + 1}>
              <div className="car-card">
                <img className="car-img" src={car.immaggineauto || "/placeholder-car.webp"} alt={`${car.marca} ${car.modello}`} />
                <h3>{car.marca} {car.modello}</h3>
                <p className="price">€ {car.prezzogiornaliero?.toFixed(2)} / day</p>
                <div className="specs">
                  <span>🚗 {car.categoria || "Auto"}</span>
                  <span>👨‍👩‍👦 {car.porte || 4}</span>
                  <span>⚡ {car.alimentazione || "N/A"}</span>
                </div>
                <button className="rent-btn" onClick={() => navigate(`/rents/${car.id}`)}>Rent Now</button>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div className="see-all-container">
          <AnimatedCard index={0} from="bottom">
            <button className="see-all-btn" onClick={() => navigate("/rents")}>See all Cars</button>
          </AnimatedCard>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <AnimatedCard index={0} from="left">
          <h2>How it Works</h2>
        </AnimatedCard>
        <div className="how-grid">
          {[
            { icon: <MapPin size={32} />, title: "Choose Location", desc: "Select where you want to pick up and drop off your car." },
            { icon: <CalendarDays size={32} />, title: "Select Dates", desc: "Pick your rental start and end dates in seconds." },
            { icon: <Car size={32} />, title: "Enjoy the Drive", desc: "Drive in comfort and style with premium vehicles." },
            { icon: <CreditCard size={32} />, title: "Pay with Ease", desc: "Pay for your rental with ease and convenience." },
          ].map((item, idx) => (
            <AnimatedCard key={item.title} index={idx + 1} from="bottom">
              <div className="how-card">
                {item.icon}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section">
        <AnimatedCard index={0} from="left">
          <h2>Why Choose Us</h2>
        </AnimatedCard>
        <div className="service-grid">
          {[
            { icon: <ShieldCheck size={32} />, title: "Trusted Service", desc: "Professional assistance and 24/7 support." },
            { icon: <DollarSign size={32} />, title: "Transparent Pricing", desc: "No hidden costs, pay only what you see." },
            { icon: <Smartphone size={32} />, title: "Book Anywhere", desc: "Our app makes booking fast and convenient." },
            { icon: <Heart size={32} />, title: "Customer Satisfaction", desc: "100% customer satisfaction guarantee." },
          ].map((item, idx) => (
            <AnimatedCard key={item.title} index={idx + 1} from="bottom">
              <div className="service-card">
                {item.icon}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p className="footer-text">© 2025 Luxedrive. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}
