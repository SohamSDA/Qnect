export const userDashboardMock = {
  user: {
    userId: "u_123",
    name: "Student User",
  },
  queue: {
    queueId: "q_admin_docs",
    name: "Admin Office - Document Verification",
    location: "Ground Floor, Block A",
    status: "active",
  },
  token: {
    tokenNumber: "T-042",
    seq: 42,
    status: "waiting",
  },
  liveContext: {
    nowServing: "T-039",
    countersActive: 2,
  },
  estimate: {
    estimatedWaitMinutes: 12,
    usersAhead: 3,
  },
  reassurance: {
    message: "You will be notified when your turn is near. You can safely wait.",
  },
  lastUpdated: "10:28 AM",
};

export const userNearTurnMock = {
  ...userDashboardMock,
  token: {
    tokenNumber: "T-042",
    seq: 42,
    status: "near",
  },
  liveContext: {
    nowServing: "T-041",
    countersActive: 2,
  },
  estimate: {
    estimatedWaitMinutes: 3,
    usersAhead: 1,
  },
  reassurance: {
    message: "Get ready! Your turn is coming up shortly.",
  },
};

export const userServedMock = {
  ...userDashboardMock,
  token: {
    tokenNumber: "T-042",
    seq: 42,
    status: "served",
  },
  estimate: null,
  reassurance: {
    message: "You have been served. Thank you!",
  },
};

export const userCancelledMock = {
  ...userDashboardMock,
  token: {
    tokenNumber: "T-042",
    seq: 42,
    status: "cancelled",
  },
  estimate: null,
  reassurance: {
    message: "You left the queue. You can join again anytime.",
  },
};

export const userNoActiveQueueMock = {
  user: {
    userId: "u_123",
    name: "Student User",
  },
  activeQueue: null,
  message: "You are not in any queue right now.",
  actionHint: "Browse available queues to get started.",
};

export const sidebarMockData = {
  userProfile: {
    name: "Student User",
    email: "student@university.edu",
    studentId: "2024-CS-123",
    joinedQueues: 8,
  },
  queueHistory: [
    {
      id: "h1",
      queueName: "Library - Book Issue",
      date: "Today, 9:15 AM",
      status: "completed",
      waitTime: "8 min",
    },
    {
      id: "h2",
      queueName: "Admin Office - ID Card",
      date: "Yesterday, 2:30 PM",
      status: "completed",
      waitTime: "15 min",
    },
  ],
};
