import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../UIX/Checkout.css'; 

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('Preparazione checkout...');
  const [user, setUser] = useState(null);

  const location = useLocation();
  const { userId, veicolo_id, prezzo_giornaliero, prenotazione_id, selectedMethod } = location.state;

  

  return (
    <div className="checkout-container">
      <h1>Checkout Page</h1>
      <p>{text}</p>
      {loading && <div className="loading-icon"></div>}
    </div>
  );
}
