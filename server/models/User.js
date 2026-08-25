const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 30 },

  lastUsernameChange: { type: Date, default: null },

  usernameNormalized: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },

  password: { 
    type: String,
    required: true,
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, 'Senha não atende aos requisitos']},

  profilePicture: { type: String, default: '' },

  hideEmail: { type: Boolean, default: true },

  type: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },

  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: { type: Number, default: 0 },

  ratedClasses: [{
    classesIds: { type: mongoose.Schema.Types.ObjectId, ref: 'Class'},
    rate: {type: Number, required: true}
  }],

  ratedPlaylists: [{
    playlistsIds: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist'},
    rate: {type: Number, required: true}
  }],

  banned: { type: Boolean, default: false },

  isVerified: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);