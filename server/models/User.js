const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 20 },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  type: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },

  banido: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
