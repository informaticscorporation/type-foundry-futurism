import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import '../UIX/Checkout.css';

export default function Checkout() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState(t("checkout.preparing"));
  const location = useLocation();
  const { userId, veicolo_id, prezzo_giornaliero, prenotazione_id, selectedMethod } = location.state;

  return (
    <div className="checkout-container">
      <h1>{t("checkout.title")}</h1>
      <p>{text}</p>
      {loading && <div className="loading-icon"></div>}
    </div>
  );
}
