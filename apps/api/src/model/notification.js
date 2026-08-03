import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    eventType: { type: String, required: true, enum: ['release'], immutable: true },
    mediaType: { type: String, required: true, enum: ['movie', 'tv'], immutable: true },
    tmdbId: { type: Number, required: true, min: 1, immutable: true },
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
