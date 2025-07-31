const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");
const authorize = require("../middlewares/authorize");
const { uploadMessageMedia } = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");

router.get("/slug", authenticate, channelController.getSlug);

router.post(
  "/create",
  authenticate,
  uploadMessageMedia,
  channelController.createChannel
);
router.get("/my-channel", authenticate, channelController.getUserChannels);
router.delete(
  "/delete/:channelId",
  authenticate,
  channelController.deleteChannel
);
router.put(
  "/update/:channelId",
  authenticate,
  uploadMessageMedia,
  channelController.updateChannel
);
router.post(
  "/subscribe/:channelId",
  authenticate,
  channelController.subscribeChannel
);
router.delete(
  "/leave/:channelId",
  authenticate,
  channelController.leaveChannel
);

router.get("/:channelId", authenticate, channelController.getChannelById);
router.delete(
  "/:channelId/remove-user/:userIdToRemove",
  authenticate,
  channelController.removeUserFromChannel
);
router.put(
  "/:channelId/add-user",
  authenticate,
  channelController.addUserInChannel
);

router.get("/slug/:slug", authenticate, channelController.getChannelBySlug);

router.post(
  "/report/:channelId",
  authenticate,
  channelController.reportChannel
);

module.exports = router;
