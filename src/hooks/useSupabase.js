import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

/**
 * Hook generico per fetch da una tabella Supabase.
 * @param {string} table - Nome tabella
 * @param {object} options - { orderBy, ascending, enabled }
 */
export function useSupabaseTable(table, options = {}) {
  const { orderBy = null, ascending = false, enabled = true } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    let query = supabase.from(table).select("*");
    if (orderBy) query = query.order(orderBy, { ascending });
    const { data: result, error: err } = await query;
    if (err) {
      console.error(`Errore fetch ${table}:`, err);
      setError(err);
    }
    setData(result || []);
    setLoading(false);
  }, [table, orderBy, ascending, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}

// ====== HOOKS SPECIFICI ======

export function useVehicles() {
  return useSupabaseTable("Vehicles");
}

export function usePrenotazioni() {
  return useSupabaseTable("Prenotazioni", { orderBy: "data_creazione", ascending: false });
}

export function useUsers() {
  return useSupabaseTable("Users", { orderBy: "created_at", ascending: false });
}

export function usePagamenti() {
  return useSupabaseTable("pagamenti", { orderBy: "data_creazione", ascending: false });
}

// ====== MUTATION HELPERS ======

export function useSupabaseInsert(table) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const insert = useCallback(async (record) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from(table).insert([record]).select();
    setLoading(false);
    if (err) {
      console.error(`Errore insert ${table}:`, err);
      setError(err);
      return null;
    }
    return data;
  }, [table]);

  return { insert, loading, error };
}

export function useSupabaseUpdate(table) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, record) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from(table).update(record).eq("id", id).select();
    setLoading(false);
    if (err) {
      console.error(`Errore update ${table}:`, err);
      setError(err);
      return null;
    }
    return data;
  }, [table]);

  return { update, loading, error };
}

export function useSupabaseDelete(table) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.from(table).delete().eq("id", id);
    setLoading(false);
    if (err) {
      console.error(`Errore delete ${table}:`, err);
      setError(err);
      return false;
    }
    return true;
  }, [table]);

  return { remove, loading, error };
}
