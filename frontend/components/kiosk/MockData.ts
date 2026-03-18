// mockKioskData.ts
export const kioskQueueMock = {
  queueId: "admin-doc-verification",
  queueName: "Admin Office - Document Verification",
  location: "Ground Floor, Block A",

  nowServing: {
    tokenNumber: "T-042",
    counter: 2,
  },

  nextTokens: ["T-043", "T-044", "T-045", "T-046"],

  counters: [
    { counterId: 1, status: "busy", currentToken: "T-041" },
    { counterId: 2, status: "serving", currentToken: "T-042" },
    { counterId: 3, status: "idle", currentToken: null },
  ],

  lastUpdated: new Date().toISOString(),
};
