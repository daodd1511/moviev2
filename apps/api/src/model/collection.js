import mongoose from 'mongoose';

const { Schema } = mongoose;

const collectionItemSchema = new Schema(
  {
    mediaType: { type: String, required: true, enum: ['movie', 'tv'] },
    tmdbId: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    posterPath: { type: String, default: null, maxlength: 500 },
    releaseDate: { type: String, default: '', maxlength: 30 },
    voteAverage: { type: Number, required: true, min: 0, max: 10 },
  },
  { _id: false },
);

const collaboratorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    role: { type: String, required: true, enum: ['owner', 'editor', 'viewer'] },
  },
  { _id: false },
);

const coverSchema = new Schema(
  {
    mediaType: { type: String, required: true, enum: ['movie', 'tv'] },
    tmdbId: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const collectionSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, default: null, maxlength: 2000 },
    visibility: {
      type: String,
      required: true,
      enum: ['private', 'unlisted', 'public'],
      default: 'private',
    },
    items: { type: [collectionItemSchema], default: [] },
    collaborators: { type: [collaboratorSchema], default: [] },
    cover: { type: coverSchema, default: null },
    version: { type: Number, required: true, default: 0, min: 0 },
    legacyPublicId: { type: String, default: null, immutable: true },
  },
  { timestamps: true },
);

collectionSchema.index({ legacyPublicId: 1 }, { unique: true, sparse: true });
collectionSchema.index({ ownerId: 1, updatedAt: -1 });

const Collection = mongoose.model('collection', collectionSchema);

export default Collection;
