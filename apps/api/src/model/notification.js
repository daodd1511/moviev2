import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    eventType: {
      type: String,
      required: true,
      enum: ['release', 'collection_invite'],
      immutable: true,
    },
    mediaType: { type: String, enum: ['movie', 'tv'], default: null, immutable: true },
    tmdbId: { type: Number, min: 1, default: null, immutable: true },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: 'collection',
      default: null,
      immutable: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    channel: { type: String, required: true, enum: ['in_app'], default: 'in_app' },
    dedupeKey: { type: String, required: true, immutable: true },
    scheduledAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, dedupeKey: 1 }, { unique: true });

const Notification = mongoose.model('notification', notificationSchema);

export default Notification;
