"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export type QueueStatus = "waiting" | "near" | "served" | "cancelled" | "no-queue";

export const useQueueToasts = (status: QueueStatus) => {
  useEffect(() => {
    switch (status) {
      case "waiting":
        toast(`You’re in the queue. Sit back and relax.`, {

          duration: 3000,
        });
        break;

      case "near":
        toast.warning(`You’re next! Please stay nearby.`, {
         
          duration: 4000,
        });
        break;

      case "served":
        toast.success(`You’ve been served! `, {

          duration: 4000,
        });
        break;

      case "cancelled":
        toast.error(`You left the queue `, {

          duration: 4000,
        });
        break;

      case "no-queue":

        break;
    }
  }, [status]);
};
