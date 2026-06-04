const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 20 },

  lastUsernameChange: { type: Date, default: null },

  usernameNormalized: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },

  password: { 
    type: String,
    required: true,
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, 'Senha não atende aos requisitos']},

  profilePicture: { type: String, default: '' },

  type: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },

  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  followers: { type: Number, default: 0 },

  banned: { type: Boolean, default: false },

  isVerified: { type: Boolean, default: false },x

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
