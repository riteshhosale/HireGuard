import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ToastHost from "./components/common/ToastHost";
import CookieConsent from "./components/common/CookieConsent";
import Analytics from "./components/common/Analytics";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
        <ToastHost />
        <CookieConsent />
        <Analytics />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
