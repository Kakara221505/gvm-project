const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authorize = require("../middlewares/authorize");
const { uploadSingle } = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");

router.post("/create", authenticate, chatController.createChat);
router.get("/", authenticate, chatController.getAllChatUsers);
router.get("/:chatId", authenticate, chatController.getChatById);

module.exports = router;
