import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {type: String, required: true},
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  profile_picture: { type: String, required: true },
  phone_number: { type: String, required: true},
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    required: true
  },
  date_joined: {
    type: Date,
    default: Date.now,
    required: true
  },
  bio: { type: String, required: true },
  address: { type: String, required: true },
  social_links: {
    type: Map,
    of: String,
    required: true
  },
  token: { type: String }
});

export default mongoose.model('User', userSchema);
