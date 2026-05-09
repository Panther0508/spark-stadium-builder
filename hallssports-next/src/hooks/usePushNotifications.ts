"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
/* eslint-disable @typescript-eslint/no-explicit-any */

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" ? Notification.permission : "default"
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .ready
      .then((registration) => {
        console.log("Service Worker ready", registration);
      })
      .catch((err) => {
        console.error("Service Worker error:", err);
      });
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setError("Push notifications not supported");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        await subscribe();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? "Failed to request permission");
      } else {
        setError("Failed to request permission");
      }
    }
  };

  const subscribe = async () => {
    if (!supabase) {
      setError("Supabase not available");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Push not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicVapidKey) {
        throw new Error("VAPID public key not configured");
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      setSubscription(sub);

      const { error: insertError } = await (supabase as any)
        .from('push_subscriptions')
        .insert({
          endpoint: sub.endpoint,
          p256dh: sub.getKey('p256dh') ?? '',
          auth: sub.getKey('auth') ?? '',
        });

      if (insertError) {
        console.error("Failed to save subscription:", insertError);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? "Subscription failed");
      } else {
        setError("Subscription failed");
      }
    }
  };

  const unsubscribe = async () => {
    if (!subscription || !supabase) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      await (supabase as any)
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  };

  // Auto-subscribe if permission already granted
  useEffect(() => {
    if (permission === "granted" && !subscription) {
      subscribe();
    }
  }, [permission, subscription]);

  return {
    permission,
    subscription,
    error,
    requestPermission,
    unsubscribe,
  };
}

// Helper: convert base64 string to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}