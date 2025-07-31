const mongoose = require("mongoose");

const UserRoleSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: false, // Optional field
    },
    Description: {
      type: String,
      required: true,
    },
    Created_at: {
      type: Date,
      default: Date.now, // Automatically set the creation date
    },
    Updated_at: {
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
