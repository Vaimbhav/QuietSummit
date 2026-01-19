import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    properties: mongoose.Types.ObjectId[];
    isPublic: boolean;
    shareToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'SignUp',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100,
            default: 'My Favorites',
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        properties: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Property',
            },
        ],
        isPublic: {
            type: Boolean,
            default: false,
        },
        shareToken: {
            type: String,
            sparse: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ user: 1, name: 1 });

// Generate share token for public wishlists
WishlistSchema.pre('save', async function () {
    if (this.isPublic && !this.shareToken) {
        this.shareToken = `wl_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    }
});

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
