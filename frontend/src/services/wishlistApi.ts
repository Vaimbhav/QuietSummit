import api from './api';

export interface Wishlist {
    _id: string;
    memberId: string;
    name: string;
    description?: string;
    isDefault: boolean;
    properties: string[];
    createdAt: string;
    updatedAt: string;
}

export const getMyWishlists = async () => {
    const response = await api.get('/wishlists');
    return response.data;
};

export const createWishlist = async (data: { name: string; description?: string }) => {
    const response = await api.post('/wishlists', data);
    return response.data;
};

export const addToWishlist = async (wishlistId: string, propertyId: string) => {
    const response = await api.post(`/wishlists/${wishlistId}/add`, { propertyId });
    return response.data;
};

export const removeFromWishlist = async (wishlistId: string, propertyId: string) => {
    const response = await api.delete(`/wishlists/${wishlistId}/remove/${propertyId}`);
    return response.data;
};

export const deleteWishlist = async (wishlistId: string) => {
    const response = await api.delete(`/wishlists/${wishlistId}`);
    return response.data;
};

export const isPropertyInWishlist = async (propertyId: string) => {
    try {
        const response = await api.get(`/wishlists/check/${propertyId}`);
        return response.data;
    } catch (error) {
        return { inWishlist: false, wishlists: [] };
    }
};

export default {
    getMyWishlists,
    createWishlist,
    addToWishlist,
    removeFromWishlist,
    deleteWishlist,
    isPropertyInWishlist,
};
