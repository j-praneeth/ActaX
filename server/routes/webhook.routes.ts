import { Router } from "express";

const router = Router();

// Recall.ai webhook
router.post("/recall", async (req, res) => {
  try {
    const event = {
      source: "recall_ai",
      eventType: req.body.event || "unknown",
      payload: req.body || {},
      processed: false,
    };

    console.log("Received webhook event:", event.eventType);
    
    // Placeholder for webhook processing
    res.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

export { router as webhookRoutes };
