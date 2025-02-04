const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientAuth', required: true }, // Reference to the ClientAuth model
    name: { type: String, required: true },
    companySize: { type: String, required: true },
    preferredLanguage: { type: String, required: true },
    projects: [
      {
        name: { type: String, required: true },
        status: { type: String, required: true },
        developer: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
