import mongoose, { Schema, Document } from 'mongoose';

interface IMyConnection extends Document {
  user: Schema.Types.ObjectId;
  connections: Schema.Types.ObjectId[];
}

const myConnectionsSchema = new Schema<IMyConnection>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      unique: true,
    },
    connections: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  },
  {
    timestamps: true,
  }
);

export const MyConnection = mongoose.model<IMyConnection>(
  'MyConnection',
  myConnectionsSchema,
  'myConnection'
);
