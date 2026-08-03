import mongoose from 'mongoose';

const { Schema } = mongoose;

const collectionInvitationSchema = new Schema(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'collection',
      immutable: true,
    },
    inviterId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    inviteeId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    role: { type: String, required: true, enum: ['editor', 'viewer'], immutable: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'declined', 'revoked', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Only one pending invitation per (Collection, invitee): a fresh invite can be sent
// again once the prior one is accepted, declined, revoked, or expired.
collectionInvitationSchema.index(
  { collectionId: 1, inviteeId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
);

const CollectionInvitation = mongoose.model('collection-invitation', collectionInvitationSchema);

export default CollectionInvitation;
