const mongoose = require('mongoose');

const clientAuthSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' } // Add a reference to the Client model
  },
  { timestamps: true }
);

const ClientAuth = mongoose.model('ClientAuth', clientAuthSchema);

module.exports = ClientAuth;
