const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingController");
const authenticate = require("../middlewares/authenticate");

router.post("/add", authenticate, settingsController.updateUserSettings);
router.get("/", authenticate, settingsController.getUserSettings);

module.exports = router;
