import mongoose from 'mongoose';

const { Schema } = mongoose;

const userModel = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isPro: { type: Boolean, default: false },
    isVerify: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationAttempts: { type: Number, default: 1 },
    lastVerificationAttempt: { type: Date },
    activeSessionToken: { type: String },
    socketId: { type: String },
    token: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    imageName: { type: String },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('Users', userModel, 'users');
