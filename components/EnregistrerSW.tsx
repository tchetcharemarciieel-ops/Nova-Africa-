"use client";

import { useEffect } from "react";

export default function EnregistrerSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => { /* silencieux : l'application marche sans */ });
  }, []);
  return null;
}
