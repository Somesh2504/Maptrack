import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}], // Users this user has shared location with
  canAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}], // Users whose location this user can access
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;