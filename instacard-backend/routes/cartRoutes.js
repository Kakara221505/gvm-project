const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authenticate = require("../middlewares/authenticate");

router.post("/add", authenticate, cartController.addToCart);
router.delete("/remove/:id", authenticate, cartController.removeFromCart);
router.get("/get-all", authenticate, cartController.getCart);
module.exports = router;
