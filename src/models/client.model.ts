import mongoose from 'mongoose';

const { Schema } = mongoose;

const clientSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  lastResponse: { type: Date, default: Date.now },
});

const Client = mongoose.model('Client', clientSchema, 'dbConnectlient');
export default Client;
