"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client/api";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function initialPermission(): NotificationPermission {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "default";
}

export function PushSettings() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(initialPermission);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .vapidPublicKey()
      .then((r) => {
        if (cancelled) return;
        setConfigured(r.enabled);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    if ("serviceWorker" in navigator && "Notification" in window) {
      navigator.serviceWorker.ready.then(async (reg) => {
        if (cancelled) return;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setSubscribed(Boolean(sub));
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const activate = useCallback(async () => {
    setMessage(null);
    if (!configured) {
      setMessage("Las notificaciones no están configuradas (faltan claves VAPID).");
      return;
    }
    setWorking(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setMessage("Permiso de notificaciones denegado.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const { key } = await api.vapidPublicKey();
      if (!key) {
        setMessage("Falta la clave pública VAPID.");
        return;
      }
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        });
      }
      await api.subscribePush(sub.toJSON());
      setSubscribed(true);
      setMessage("Notificaciones activadas ✓");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al activar notificaciones");
    } finally {
      setWorking(false);
    }
  }, [configured]);

  const deactivate = useCallback(async () => {
    setWorking(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMessage("Notificaciones desactivadas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al desactivar");
    } finally {
      setWorking(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    setMessage(null);
    const res = await api.testPush().catch((e) => ({ ok: false as const, message: e.message }));
    setMessage(res.ok ? "Notificación de prueba enviada ✓" : res.message ?? "Error");
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <h2 className="mb-1 font-semibold">Notificaciones push</h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        Recibe recordatorios diarios y avisos de metas atrasadas en tu teléfono.
      </p>

      {configured === false ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Notificaciones no configuradas en el servidor (faltan claves VAPID).
        </p>
      ) : configured === null ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Comprobando…</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {!subscribed ? (
            <button
              onClick={activate}
              disabled={working || permission === "denied"}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {working ? "Activando…" : "🔔 Activar notificaciones"}
            </button>
          ) : (
            <>
              <button
                onClick={sendTest}
                disabled={working}
                className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-60"
              >
                Enviar prueba
              </button>
              <button
                onClick={deactivate}
                disabled={working}
                className="rounded-lg border border-red-200 dark:border-red-900 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-60"
              >
                Desactivar
              </button>
            </>
          )}
        </div>
      )}

      {message && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>}
    </div>
  );
}