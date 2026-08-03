import mongoose from 'mongoose';

const { Schema } = mongoose;

const followSchema = new Schema(
  {
    followerId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    followingId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
  },
  { timestamps: true },
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followingId: 1 });

const Follow = mongoose.model('follow', followSchema);

export default Follow;
