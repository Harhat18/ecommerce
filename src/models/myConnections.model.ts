import mongoose, { Schema, Document } from 'mongoose';

interface Connection {
  userId: mongoose.Types.ObjectId;
  phoneNumber: string;
}

interface MyConnectionDocument extends Document {
  user: mongoose.Types.ObjectId;
  connections: Connection[];
}

const myConnectionSchema = new Schema<MyConnectionDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  connections: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
      phoneNumber: { type: String, required: true },
    },
  ],
});

export const MyConnection = mongoose.model<MyConnectionDocument>(
  'MyConnection',
  myConnectionSchema,
  'myConnection'
);
