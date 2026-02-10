import { useState, useEffect } from "react";
import {
  LayoutDashboard, Car, CalendarDays, Users, Wallet, BarChart3, Settings, ClipboardList,
} from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import "../UIX/Sidebar.css";

export default function Sidebar({ menuOpen, setMenuOpen, mobileMenuOpen, setMobileMenuOpen }) {
  const { t } = useTranslation();
  const [mobile, setMobile] = useState(false);

  const buttons = [
    { id: "dashboard", label: t("sidebar.dashboard"), icon: <LayoutDashboard size={20} /> },
    { id: "reports", label: t("sidebar.reports"), icon: <BarChart3 size={20} /> },
    { id: "cars", label: t("sidebar.cars"), icon: <Car size={20} /> },
    { id: "contracts", label: t("sidebar.contracts"), icon: <ClipboardList size={20} /> },
    { id: "bookings", label: t("sidebar.bookings"), icon: <ClipboardList size={20} /> },
    { id: "calendarRentals", label: t("sidebar.calendarRentals"), icon: <CalendarDays size={20} /> },
    { id: "calendarInternal", label: t("sidebar.calendarInternal"), icon: <CalendarDays size={20} /> },
    { id: "clients", label: t("sidebar.clients"), icon: <Users size={20} /> },
    { id: "payments", label: t("sidebar.payments"), icon: <Wallet size={20} /> },
    { id: "settings", label: t("sidebar.settings"), icon: <Settings size={20} /> },
  ];

  useEffect(() => { setMobile(window.innerWidth <= 768); }, []);

  return (
    <div className={`sidebar-container ${mobileMenuOpen ? "open" : ""}`}>
      <div className="sidebar-header"><img className="logo" src="/logo.webp" alt="Logo" /></div>
      <div className="sidebar-menu">
        {buttons.map((btn) => (
          <button key={btn.id} className={`sidebar-btn ${menuOpen === btn.id ? "active" : ""}`}
            onClick={() => { setMenuOpen(btn.id); if (mobile) setMobileMenuOpen(false); }}>
            {btn.icon}<span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
