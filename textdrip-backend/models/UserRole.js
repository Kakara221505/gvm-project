const mongoose = require("mongoose");

const UserRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false, // Optional field
    },
    description: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the creation date
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically set the updated date
    },
  },
  {
    collection: "UserRole",
    timestamps: { createdAt: "Created_at", updatedAt: "Updated_at" }, 
  }
);


module.exports = mongoose.model("UserRole", UserRoleSchema);
