-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  SQL PER RICREARE COMPLETAMENTE IL DATABASE                  ║
-- ║  ⚠️ ATTENZIONE: QUESTO CANCELLERÀ TUTTI I DATI ESISTENTI    ║
-- ║  Eseguire nell'SQL Editor di Supabase                        ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ░░░ STEP 1: DROP TABELLE ESISTENTI ░░░
DROP TABLE IF EXISTS pagamenti CASCADE;
DROP TABLE IF EXISTS "Prenotazioni" CASCADE;
DROP TABLE IF EXISTS "Vehicles" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS multe CASCADE;
DROP TABLE IF EXISTS sinistri CASCADE;
DROP TABLE IF EXISTS checkout_veicolo CASCADE;
DROP TABLE IF EXISTS secondo_guidatore CASCADE;
DROP TABLE IF EXISTS manutenzione_programmata CASCADE;
DROP TABLE IF EXISTS documenti CASCADE;

-- ░░░ STEP 2: RICREA TABELLA USERS ░░░
CREATE TABLE "Users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  cognome TEXT,
  codice_fiscale TEXT,
  ragione_sociale TEXT,
  partita_iva TEXT,
  email TEXT NOT NULL UNIQUE,
  telefono TEXT,
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  data_nascita DATE,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  "idCARDFrontimg" TEXT,
  "idCARDBackimg" TEXT,
  "patenteFront" TEXT,
  "patenteBack" TEXT,
  "taxiCardFront" TEXT,
  "taxiCardBack" TEXT,
  "tipoUtente" TEXT DEFAULT 'User',
  token TEXT,
  tokenization BOOLEAN DEFAULT FALSE
);

-- ░░░ STEP 3: RICREA TABELLA VEHICLES ░░░
CREATE TABLE "Vehicles" (
  id TEXT PRIMARY KEY,
  marca TEXT NOT NULL,
  modello TEXT NOT NULL,
  targa TEXT,
  categoria TEXT,
  colore TEXT,
  alimentazione TEXT,
  cambio TEXT,
  porte INTEGER,
  kmattuali INTEGER,
  prezzogiornaliero NUMERIC,
  immaggineauto TEXT,
  creatoda TEXT,
  modificatoda TEXT,
  datacreazione TIMESTAMP DEFAULT NOW(),
  ultimamodifica TIMESTAMP DEFAULT NOW(),
  franchigia NUMERIC,
  numeroassistenzastradale INTEGER,
  assicurazionebasic NUMERIC,
  assicurazioneconfort NUMERIC,
  assicurazionepremium NUMERIC,
  assicurazionesupertotal NUMERIC,
  statofreni TEXT,
  statooliomotore TEXT,
  statoliquidodiraffredamento TEXT,
  statoliquidofreni TEXT,
  statocarrozzeria TEXT,
  statovetrispecchietti TEXT,
  statointerni TEXT,
  statoclimatizzazione TEXT,
  statoluci TEXT,
  statosospenzioni TEXT,
  ultimamanutenzione DATE,
  prossimamanutenzione DATE,
  inmanutenzione BOOLEAN DEFAULT FALSE,
  fornitoreoleasing TEXT,
  dataingressoflotta DATE,
  datadismissioneprevista DATE,
  ultimaprenotazione DATE,
  noteinterne TEXT,
  valoredacquisto NUMERIC,
  valoreattualestimato NUMERIC,
  company_name TEXT,
  versione TEXT,
  cilindrata NUMERIC,
  n_telaio TEXT,
  ex_targa TEXT,
  data_cambio_targa DATE,
  tipo_carburante TEXT,
  serbatoio NUMERIC,
  livello_carburante NUMERIC,
  stato_veicolo TEXT,
  park TEXT,
  gruppo TEXT,
  sede TEXT,
  proprietario TEXT,
  sistema_localizzazione TEXT,
  codice_veicolo TEXT,
  uso_veicolo TEXT,
  pneumatici TEXT,
  misura_pneumatici TEXT,
  proprieta_pneumatici TEXT,
  fleet_network TEXT,
  gomme_invernali BOOLEAN DEFAULT FALSE,
  neopatentati BOOLEAN DEFAULT FALSE,
  printed_note TEXT,
  promo_car BOOLEAN DEFAULT FALSE,
  fuori_servizio BOOLEAN DEFAULT FALSE,
  rent_to_rent BOOLEAN DEFAULT FALSE,
  "Compagnia" TEXT,
  -- Nuovi campi migliorativi
  bollo_scadenza DATE,
  assicurazione_scadenza DATE,
  revisione_scadenza DATE,
  tagliando_scadenza DATE
);

-- ░░░ STEP 4: RICREA TABELLA PRENOTAZIONI ░░░
CREATE TABLE "Prenotazioni" (
  id TEXT PRIMARY KEY,
  contratto_id TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  veicolo_id TEXT NOT NULL REFERENCES "Vehicles"(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  luogo_ritiro TEXT,
  luogo_restituzione TEXT,
  stato TEXT NOT NULL DEFAULT 'prenotata',
  km_iniziali INTEGER,
  km_finali INTEGER,
  km_previsti INTEGER,
  km_extra INTEGER,
  prezzo_giornaliero NUMERIC NOT NULL,
  giorni INTEGER NOT NULL,
  totale_base NUMERIC,
  sconto NUMERIC DEFAULT 0,
  totale_pagato NUMERIC,
  deposito NUMERIC,
  franchigia NUMERIC,
  assicurazione_tipo TEXT,
  pagamento_status TEXT DEFAULT 'da pagare',
  pagamento_metodo TEXT,
  penale_cancellazione NUMERIC,
  veicolo_in_manutenzione BOOLEAN DEFAULT FALSE,
  note_cliente TEXT,
  note_interna TEXT,
  checklist_ritiro JSONB,
  checklist_restituzione JSONB,
  data_creazione TIMESTAMP DEFAULT NOW(),
  data_modifica TIMESTAMP DEFAULT NOW(),
  "OraCheckin" TIME,
  "OraCheckOut" TIME,
  -- Nuovi campi
  secondo_guidatore_id UUID REFERENCES "Users"(id),
  extras JSONB DEFAULT '{}',
  consegna_aeroporto BOOLEAN DEFAULT FALSE
);

-- ░░░ STEP 5: RICREA TABELLA PAGAMENTI ░░░
CREATE TABLE pagamenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenotazione_id TEXT NOT NULL REFERENCES "Prenotazioni"(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  veicolo_id TEXT NOT NULL REFERENCES "Vehicles"(id) ON DELETE CASCADE,
  totale_pagato NUMERIC NOT NULL DEFAULT 0,
  deposito NUMERIC NOT NULL DEFAULT 0,
  franchigia NUMERIC NOT NULL DEFAULT 0,
  franchigia_addebito NUMERIC,
  franchigia_stornata BOOLEAN DEFAULT FALSE,
  pagamento_status TEXT DEFAULT 'da pagare',
  pagamento_metodo TEXT,
  danni_descrizione TEXT,
  danni_importo NUMERIC DEFAULT 0,
  danni_addebitato BOOLEAN DEFAULT FALSE,
  data_creazione TIMESTAMP DEFAULT NOW(),
  data_aggiornamento TIMESTAMP DEFAULT NOW()
);

-- ░░░ STEP 6: NUOVA TABELLA MULTE ░░░
CREATE TABLE multe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veicolo_id TEXT NOT NULL REFERENCES "Vehicles"(id) ON DELETE CASCADE,
  prenotazione_id TEXT REFERENCES "Prenotazioni"(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
  data_multa DATE NOT NULL,
  data_notifica DATE,
  data_scadenza_pagamento DATE,
  importo NUMERIC NOT NULL DEFAULT 0,
  importo_scontato NUMERIC,
  tipo_violazione TEXT,
  numero_verbale TEXT,
  ente_emittente TEXT,
  luogo_violazione TEXT,
  punti_patente INTEGER DEFAULT 0,
  stato TEXT DEFAULT 'da_pagare', -- da_pagare, pagata, contestata, annullata, riaddebita_cliente
  pagata_da TEXT, -- azienda, cliente
  data_pagamento DATE,
  metodo_pagamento TEXT,
  riaddebitata_cliente BOOLEAN DEFAULT FALSE,
  importo_riaddebitato NUMERIC,
  note TEXT,
  documento_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ░░░ STEP 7: NUOVA TABELLA SINISTRI ░░░
CREATE TABLE sinistri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veicolo_id TEXT NOT NULL REFERENCES "Vehicles"(id) ON DELETE CASCADE,
  prenotazione_id TEXT REFERENCES "Prenotazioni"(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
  data_sinistro DATE NOT NULL,
  ora_sinistro TIME,
  luogo_sinistro TEXT,
  tipo_sinistro TEXT, -- tamponamento, uscita_strada, furto, vandalismo, grandine, altro
  descrizione TEXT,
  danni_veicolo TEXT,
  danni_terzi TEXT,
  costo_riparazione NUMERIC DEFAULT 0,
  costo_carrozzeria NUMERIC DEFAULT 0,
  franchigia_applicata NUMERIC DEFAULT 0,
  coperto_assicurazione BOOLEAN DEFAULT FALSE,
  numero_sinistro_assicurazione TEXT,
  stato TEXT DEFAULT 'aperto', -- aperto, in_lavorazione, chiuso, rifiutato
  responsabilita TEXT, -- cliente, terzi, mista, da_definire
  controparte_nome TEXT,
  controparte_targa TEXT,
  controparte_assicurazione TEXT,
  testimoni TEXT,
  rapporto_polizia BOOLEAN DEFAULT FALSE,
  numero_rapporto TEXT,
  foto_urls JSONB DEFAULT '[]',
  documenti_urls JSONB DEFAULT '[]',
  veicolo_guidabile BOOLEAN DEFAULT TRUE,
  giorni_fermo INTEGER DEFAULT 0,
  costo_fermo NUMERIC DEFAULT 0,
  note_interne TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ░░░ STEP 8: NUOVA TABELLA CHECKOUT VEICOLO ░░░
CREATE TABLE checkout_veicolo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenotazione_id TEXT NOT NULL REFERENCES "Prenotazioni"(id) ON DELETE CASCADE,
  veicolo_id TEXT NOT NULL REFERENCES "Vehicles"(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  data_checkout TIMESTAMP DEFAULT NOW(),
  operatore TEXT,
  -- Dati km e carburante
  km_finali INTEGER,
  km_percorsi INTEGER,
  km_extra INTEGER DEFAULT 0,
  costo_km_extra NUMERIC DEFAULT 0,
  livello_carburante_ritiro NUMERIC,
  livello_carburante_restituzione NUMERIC,
  differenza_carburante NUMERIC DEFAULT 0,
  costo_carburante NUMERIC DEFAULT 0,
  -- Stato veicolo restituzione
  stato_carrozzeria TEXT,
  stato_interni TEXT,
  stato_pneumatici TEXT,
  stato_pulizia TEXT, -- pulito, sporco, molto_sporco
  costo_pulizia NUMERIC DEFAULT 0,
  -- Danni
  danni_riscontrati BOOLEAN DEFAULT FALSE,
  danni_descrizione TEXT,
  danni_importo NUMERIC DEFAULT 0,
  danni_foto_urls JSONB DEFAULT '[]',
  -- Addebiti extra
  ritardo_minuti INTEGER DEFAULT 0,
  costo_ritardo NUMERIC DEFAULT 0,
  accessori_mancanti TEXT,
  costo_accessori NUMERIC DEFAULT 0,
  -- Foto prima/dopo
  foto_ritiro_urls JSONB DEFAULT '[]',
  foto_restituzione_urls JSONB DEFAULT '[]',
  -- Totali
  totale_addebiti_extra NUMERIC DEFAULT 0,
  deposito_restituito NUMERIC DEFAULT 0,
  deposito_trattenuto NUMERIC DEFAULT 0,
  -- Firma e conferma
  firma_cliente TEXT,
  firma_operatore TEXT,
  note TEXT,
  stato TEXT DEFAULT 'in_corso', -- in_corso, completato, contestato
  -- Scoring cliente
  puntualita_score INTEGER, -- 1-5
  pulizia_score INTEGER,    -- 1-5
  condizioni_score INTEGER, -- 1-5
  score_totale NUMERIC,
  -- Timeline
  timeline_eventi JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ░░░ STEP 9: NUOVA TABELLA SECONDO GUIDATORE ░░░
CREATE TABLE secondo_guidatore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenotazione_id TEXT NOT NULL REFERENCES "Prenotazioni"(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  codice_fiscale TEXT,
  data_nascita DATE,
  numero_patente TEXT,
  scadenza_patente DATE,
  categoria_patente TEXT,
  telefono TEXT,
  email TEXT,
  documento_fronte_url TEXT,
  documento_retro_url TEXT,
  patente_fronte_url TEXT,
  patente_retro_url TEXT,
  costo_extra NUMERIC DEFAULT 0,
  approvato BOOLEAN DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ░░░ STEP 10: NUOVA TABELLA MANUTENZIONE PROGRAMMATA ░░░
CREATE TABLE manutenzione_programmata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veicolo_id TEXT NOT NULL REFERENCES "Vehicles"(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- tagliando, revisione, cambio_gomme, riparazione, carrozzeria, altro
  descrizione TEXT,
  officina TEXT,
  costo_preventivo NUMERIC DEFAULT 0,
  costo_effettivo NUMERIC,
  data_programmata DATE NOT NULL,
  data_completamento DATE,
  km_al_momento INTEGER,
  prossimo_intervento_km INTEGER,
  stato TEXT DEFAULT 'programmata', -- programmata, in_corso, completata, annullata
  priorita TEXT DEFAULT 'normale', -- bassa, normale, alta, urgente
  note TEXT,
  documenti_urls JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ░░░ STEP 11: NUOVA TABELLA DOCUMENTI ░░░
CREATE TABLE documenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- contratto, multa, sinistro, manutenzione, assicurazione, patente, documento_id, altro
  riferimento_id TEXT, -- ID generico della risorsa collegata
  riferimento_tipo TEXT, -- prenotazione, veicolo, cliente, multa, sinistro
  titolo TEXT NOT NULL,
  descrizione TEXT,
  file_url TEXT NOT NULL,
  file_tipo TEXT, -- pdf, jpg, png, docx
  file_dimensione INTEGER,
  caricato_da TEXT,
  data_scadenza DATE,
  firmato BOOLEAN DEFAULT FALSE,
  firma_url TEXT,
  data_firma TIMESTAMP,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ░░░ STEP 12: INDICI PER PERFORMANCE ░░░
CREATE INDEX idx_prenotazioni_cliente ON "Prenotazioni"(cliente_id);
CREATE INDEX idx_prenotazioni_veicolo ON "Prenotazioni"(veicolo_id);
CREATE INDEX idx_prenotazioni_stato ON "Prenotazioni"(stato);
CREATE INDEX idx_prenotazioni_dates ON "Prenotazioni"(check_in, check_out);
CREATE INDEX idx_pagamenti_prenotazione ON pagamenti(prenotazione_id);
CREATE INDEX idx_pagamenti_cliente ON pagamenti(cliente_id);
CREATE INDEX idx_multe_veicolo ON multe(veicolo_id);
CREATE INDEX idx_multe_stato ON multe(stato);
CREATE INDEX idx_sinistri_veicolo ON sinistri(veicolo_id);
CREATE INDEX idx_sinistri_stato ON sinistri(stato);
CREATE INDEX idx_checkout_prenotazione ON checkout_veicolo(prenotazione_id);
CREATE INDEX idx_manutenzione_veicolo ON manutenzione_programmata(veicolo_id);
CREATE INDEX idx_manutenzione_stato ON manutenzione_programmata(stato);
CREATE INDEX idx_documenti_riferimento ON documenti(riferimento_id, riferimento_tipo);
CREATE INDEX idx_secondo_guidatore_prenotazione ON secondo_guidatore(prenotazione_id);

-- ░░░ STEP 13: RLS (opzionale - da personalizzare) ░░░
-- ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Vehicles" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Prenotazioni" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pagamenti ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE multe ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sinistri ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE checkout_veicolo ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE secondo_guidatore ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE manutenzione_programmata ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documenti ENABLE ROW LEVEL SECURITY;

-- ✅ COMPLETATO! Tutte le tabelle sono state ricreate con successo.
