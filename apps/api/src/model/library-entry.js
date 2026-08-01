import mongoose from 'mongoose';

const { Schema } = mongoose;

const tvProgressSchema = new Schema(
  {
    season: { type: Number, required: true, min: 1 },
    episode: { type: Number, required: true, min: 1 },
    watchedEpisodeCount: { type: Number, min: 1, default: null },
  },
  { _id: false },
);

const mediaSnapshotSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    posterPath: { type: String, default: null, maxlength: 500 },
    releaseDate: { type: Date, default: null },
    voteAverage: { type: Number, required: true, min: 0, max: 10 },
  },
  { _id: false },
);

const libraryEntrySchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    mediaType: { type: String, required: true, enum: ['movie', 'tv'], immutable: true },
    tmdbId: { type: Number, required: true, min: 1, immutable: true },
    watchState: {
      type: String,
      required: true,
      enum: ['planned', 'watching', 'completed', 'paused', 'dropped'],
      default: 'planned',
    },
    rating: { type: Number, min: 1, max: 10, default: null },
    notes: { type: String, default: null, maxlength: 5000 },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastWatchedAt: { type: Date, default: null },
    tvProgress: { type: tvProgressSchema, default: null },
    mediaSnapshot: { type: mediaSnapshotSchema, required: true },
  },
  { timestamps: true },
);

libraryEntrySchema.index({ ownerId: 1, mediaType: 1, tmdbId: 1 }, { unique: true });

const LibraryEntry = mongoose.model('library-entry', libraryEntrySchema);

export default LibraryEntry;
