import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationPreferenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'user',
      immutable: true,
    },
    timezone: { type: String, required: true, trim: true, maxlength: 100, default: 'UTC' },
    events: {
      release: { type: Boolean, required: true, default: true },
    },
  },
  { timestamps: true },
);

const NotificationPreference = mongoose.model(
  'notification-preference',
  notificationPreferenceSchema,
);

export default NotificationPreference;
