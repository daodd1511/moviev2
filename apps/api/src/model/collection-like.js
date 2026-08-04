import mongoose from 'mongoose';

const { Schema } = mongoose;

const collectionLikeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'user', immutable: true },
    collectionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'collection',
      immutable: true,
    },
  },
  { timestamps: true },
);

collectionLikeSchema.index({ userId: 1, collectionId: 1 }, { unique: true });
collectionLikeSchema.index({ collectionId: 1 });

const CollectionLike = mongoose.model('collection-like', collectionLikeSchema);

export default CollectionLike;
