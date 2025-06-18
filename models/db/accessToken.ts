import mongoose from 'mongoose';

const accessTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'role', // Dynamically refer to Admin, Member, or User based on role
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

export default mongoose.model('AccessToken', accessTokenSchema);
