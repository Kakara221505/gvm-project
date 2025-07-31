const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authorize = require("../middlewares/authorize");
const { uploadMessageMedia } = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");



router.get("/common-group/:userId", authenticate, groupController.commonGroup);
router.post(
  "/create",
  authenticate,
  uploadMessageMedia,
  groupController.createGroup
);
router.get("/my-groups", authenticate, groupController.getUserGroups);
router.delete("/delete/:groupId", authenticate, groupController.deleteGroup);
router.put(
  "/update/:groupId",
  authenticate,
  uploadMessageMedia,
  groupController.updateGroup
);
router.delete("/leave/:groupId", authenticate, groupController.leaveGroup);

router.get("/:groupId", authenticate, groupController.getGroupById);
router.delete(
  "/:groupId/remove-user/:userIdToRemove",
  authenticate,
  groupController.removeUserFromGroup
);
router.put("/add-user/:groupId", authenticate, groupController.addUserInGroup);
router.put(
  "/add-admin/:groupId",
  authenticate,
  groupController.addAdminUserInGroup
);
router.post("/report/:groupId", authenticate, groupController.reportGroup);
router.put(
  "/remove-admin/:groupId",
  authenticate,
  groupController.removeAdminFromGroup
);

router.delete("/deletedByOwner/:groupId", authenticate,groupController. groupDeletedByOwner);



module.exports = router;
