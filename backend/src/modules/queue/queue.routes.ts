import { Router } from "express";

import {
  createQueue,
  generateToken,
  updateTokenStatus,
  getQueueOperatorView,
  getQueuesForUsers,
  getEstimatedWaitTime,
  extendTokenTime,
  markTokenNoShow,
  recallToken,
} from "./queue.controller.js";
import { verifyJWT, authorize } from "../../middlewares/auth.js";

const router = Router();
// Backend-native estimated wait time endpoint
router.get("/:queueId/estimated-wait", getEstimatedWaitTime);

// Public endpoint to get all queues for users
router.get("/", getQueuesForUsers);

// queues
// Only operators and admins can create queues
router.post("/", verifyJWT, authorize("operator", "admin"), createQueue);

// Get the unified view for the operator dashboard
router.get(
  "/:queueId/operator-view",
  verifyJWT,
  authorize("operator", "admin"),
  getQueueOperatorView,
);

// tokens
// Authenticated endpoint for users to get a token (rate limited per user)
router.post("/:queueId/tokens", verifyJWT, generateToken);

// Only operators/admins can update status (serve/skip)
router.patch(
  "/tokens/:tokenId/status",
  verifyJWT,
  authorize("operator", "admin"),
  updateTokenStatus,
);

router.post(
  "/tokens/:tokenId/extend",
  verifyJWT,
  authorize("operator", "admin"),
  extendTokenTime,
);

router.post(
  "/tokens/:tokenId/no-show",
  verifyJWT,
  authorize("operator", "admin"),
  markTokenNoShow,
);

router.post(
  "/tokens/:tokenId/recall",
  verifyJWT,
  authorize("operator", "admin"),
  recallToken,
);

export default router;
