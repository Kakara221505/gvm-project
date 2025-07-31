const authorize = require("../middlewares/authorize");
const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const messageController = require("../controllers/messageController");
const { uploadMessageMedia } = require("../middlewares/upload");
const { processMessageMedia } = require("../middlewares/messageUpload");

router.delete("/:messageId", authenticate, messageController.deleteMessage);
router.post(
  "/send",
  authenticate,
  // uploadMessageMedia,
  uploadMessageMedia,
  messageController.sendMessage
);
router.post("/get", authenticate, messageController.getMessages);
router.post("/media/get", authenticate, messageController.getMediaMessages);
router.put("/mark-as-read/:messageId", messageController.markAsRead);
router.post("/schedule", authenticate, messageController.scheduleMessage);
router.post(
  "/schedule/get",
  authenticate,
  messageController.getScheduledMessages
);
router.post(
  "/schedule/send/:messageId",
  authenticate,
  messageController.sendScheduledMessage
);
router.delete(
  "/schedule/:messageId",
  authenticate,
  messageController.deleteScheduledMessage
);
router.put(
  "/schedule/:messageId",
  authenticate,
  messageController.updateScheduledMessage
);
router.delete(
  "/allChat/:conversationId",
  authenticate,
  messageController.deleteConversation
);

router.delete(
  "/singleChat/:messageId",
  authenticate,
  messageController.deleteMessageForMe
);

router.put("/edit", authenticate, messageController.updateMessage);



module.exports = router;
