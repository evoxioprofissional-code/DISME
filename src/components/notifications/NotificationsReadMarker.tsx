"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsRead } from "@/lib/actions";

export function NotificationsReadMarker() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    void markNotificationsRead().then(() => {
      if (active) router.refresh();
    });
    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
