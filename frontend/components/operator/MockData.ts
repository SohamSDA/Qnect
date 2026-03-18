// operatorQueueMock.ts
export const operatorQueueMock = {
  queueId: "66b0c9f2a1f9b9a001234567",
  name: "Admin Office – Document Verification",
  location: "Ground Floor, Block A",
  isActive: true,
  counters: [1, 2],
};

// operatorTokensMock.ts
export const operatorTokensMock = [
  {
    _id: "t1",
    seq: 41,
    status: "served",
  },
  {
    _id: "t2",
    seq: 42,
    status: "waiting",
  },
  {
    _id: "t3",
    seq: 43,
    status: "waiting",
  },
  {
    _id: "t4",
    seq: 44,
    status: "waiting",
  },
  {
    _id: "t5",
    seq: 45,
    status: "waiting",
  },
];

// operatorViewMock.ts
export const operatorViewMock = {
  nowServing: {
    token: "T-042",
    seq: 42,
    counter: 1,
  },

  upcomingTokens: ["T-043", "T-044", "T-045"],

  stats: {
    waitingCount: 4,
    lastUpdated: "10:22 AM",
  },
};

