import { apiService } from "../api";
import { Queue } from "../../components/queue/queue.types";

export const queueService = {
  async getQueues(): Promise<Queue[]> {
    try {
      const response = await apiService.get("/queues", false);
      const queues: Queue[] = response.queues || [];
      return queues;
    } catch (error) {
      console.error("Failed to fetch queues:", error);
      throw error;
    }
  },
};
