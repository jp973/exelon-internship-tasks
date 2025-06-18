import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'role', // Will dynamically refer to Admin, Member, or User
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'user'],
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RefreshToken', refreshTokenSchema);
