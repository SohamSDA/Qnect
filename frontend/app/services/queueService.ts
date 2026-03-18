import { apiService } from "./api";
import { Queue } from "../../components/queue/queue.types";

export const queueService = {
  async getQueues(): Promise<Queue[]> {
    try {
      const response = await apiService.get("/queues", false);
      return response.queues || [];
    } catch (error) {
      console.error("Failed to fetch queues:", error);
      throw error;
    }
  },
};
