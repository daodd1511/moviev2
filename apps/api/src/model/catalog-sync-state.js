import mongoose from 'mongoose';
const { Schema } = mongoose;
const releaseSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    releaseDate: { type: Date, default: null },
    posterPath: { type: String, default: null },
  },
  { _id: false },
);
const schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'catalog-release-sync' },
    cursor: { type: String, default: null },
    releases: { type: [releaseSchema], default: [] },
    lastRunAt: { type: Date, default: null },
    audit: { scanned: { type: Number, default: 0 }, updated: { type: Number, default: 0 } },
  },
  { timestamps: true },
);
export default mongoose.model('catalog-sync-state', schema);
