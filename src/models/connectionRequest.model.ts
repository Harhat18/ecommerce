import mongoose from 'mongoose';

const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const ConnectionRequest = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema,
  'connectionRequests'
);
