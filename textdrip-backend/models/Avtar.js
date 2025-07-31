const mongoose = require("mongoose");

const AvtarSchema = new mongoose.Schema(
    {
      avtarImage: { type: String },
    },
    {
      timestamps: true,
      collection: 'Avtar', // <- forces Mongoose to use this exact collection name
    }
  );
  

module.exports = mongoose.model("Avtar", AvtarSchema);
