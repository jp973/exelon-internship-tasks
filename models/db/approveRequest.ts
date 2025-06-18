import mongoose from 'mongoose';

const approveRequestSchema = new mongoose.Schema({  
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
userName: { type: String, required: true },
groupName: { type: String, required: true }, // 👈 Add this
status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

export default mongoose.model('ApproveRequest', approveRequestSchema);