import { useEffect } from "react";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

function loadAnalytics() {
  if (!GA_ID || document.getElementById("jobguard-ga-script")) return;
  const script = document.createElement("script");
  script.id = "jobguard-ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

export default function Analytics() {
  useEffect(() => {
    const consent = localStorage.getItem("jobguard_cookie_consent");
    if (consent === "all") loadAnalytics();
    const handler = (event) => { if (event.detail === "all") loadAnalytics(); };
    window.addEventListener("jobguard:cookie-consent", handler);
    return () => window.removeEventListener("jobguard:cookie-consent", handler);
  }, []);
  return null;
}
