import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useTranslation } from "../i18n/useTranslation";
import "../UIX/Checkout.css";

const SERVER_URL = "https://server-noloe.fly.dev";

// Flow steps: tokenization → sale → reservation → done
const STEPS = ["tokenization", "sale", "reservation"];

export default function PagamentoSuccesso() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | redirecting | success | error
  const [message, setMessage] = useState(t("paymentFlow.verifying"));
  const [stepLabel, setStepLabel] = useState("");

  useEffect(() => {
    processFlow();
  }, []);

  async function processFlow() {
    try {
      const flowRaw = localStorage.getItem("payment_flow");
      if (!flowRaw) {
        setStatus("error");
        setMessage(t("paymentFlow.noFlowData"));
        return;
      }

      const flow = JSON.parse(flowRaw);
      const currentStep = flow.step;
      const currentIndex = STEPS.indexOf(currentStep);

      setStepLabel(t(`paymentFlow.step_${currentStep}`));

      // 1. Verify the current step
      setMessage(t("paymentFlow.verifying"));
      const verifyRes = await fetch(`${SERVER_URL}/verify-payment`);
      const verifyData = await verifyRes.json();
      console.log("Verify response:", verifyData);

      // Check if verify was successful
      if (verifyData.error) {
        setStatus("error");
        setMessage(t("paymentFlow.verifyFailed"));
        return;
      }

      // Save token if tokenization step
      if (currentStep === "tokenization" && verifyData.tokenValue) {
        flow.tokenValue = verifyData.tokenValue;
      }

      // Save tranId for capture/refund later
      if (verifyData.tranId) {
        flow.lastTranId = verifyData.tranId;
      }

      // 2. Move to next step
      const nextIndex = currentIndex + 1;

      if (nextIndex >= STEPS.length) {
        // All steps completed!
        await savePagamentoToDb(flow, verifyData);
        localStorage.removeItem("payment_flow");
        localStorage.removeItem("payment_ids");
        setStatus("success");
        setMessage(t("paymentFlow.allCompleted"));
        return;
      }

      const nextStep = STEPS[nextIndex];
      flow.step = nextStep;
      localStorage.setItem("payment_flow", JSON.stringify(flow));

      // 3. Init the next step
      setStatus("redirecting");
      setMessage(t(`paymentFlow.initiating_${nextStep}`));

      let endpoint;
      if (nextStep === "sale") endpoint = "/init-payment-sale";
      else if (nextStep === "reservation") endpoint = "/init-payment-reservation";

      const initRes = await fetch(`${SERVER_URL}${endpoint}`);
      const initData = await initRes.json();

      if (initData.url) {
        localStorage.setItem("payment_ids", JSON.stringify({
          paymentId: initData.paymentId,
          txId: initData.txId,
        }));
        // Redirect to gateway
        window.location.href = initData.url;
      } else {
        setStatus("error");
        setMessage(t("paymentFlow.initError"));
      }
    } catch (err) {
      console.error("Payment flow error:", err);
      setStatus("error");
      setMessage(t("paymentFlow.genericError"));
    }
  }

  async function savePagamentoToDb(flow, verifyData) {
    try {
      await supabase.from("pagamenti").insert({
        prenotazione_id: flow.prenotazione_id,
        cliente_id: flow.userId,
        veicolo_id: flow.veicolo_id,
        pagamento_metodo: flow.selectedMethod,
        pagamento_status: "pagato",
        totale_pagato: flow.prezzo_giornaliero || 0,
      });
    } catch (err) {
      console.error("Error saving pagamento:", err);
    }
  }

  return (
    <div className="checkout-container">
      {status === "verifying" && (
        <>
          <div className="loading-icon"></div>
          <h2>{stepLabel}</h2>
          <p>{message}</p>
        </>
      )}

      {status === "redirecting" && (
        <>
          <div className="loading-icon"></div>
          <h2>{message}</h2>
          <p>{t("paymentFlow.redirecting")}</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle size={64} color="#4CAF50" />
          <h2>{t("paymentFlow.successTitle")}</h2>
          <p>{message}</p>
          <button className="continue-button active" style={{ maxWidth: 300, marginTop: 24 }} onClick={() => navigate("/userarea")}>
            {t("paymentFlow.goToUserArea")}
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle size={64} color="#f44336" />
          <h2>{t("paymentFlow.errorTitle")}</h2>
          <p>{message}</p>
          <button className="continue-button active" style={{ maxWidth: 300, marginTop: 24 }} onClick={() => navigate("/pagamento")}>
            {t("paymentFlow.retry")}
          </button>
        </>
      )}
    </div>
  );
}
