// Wishlist Management System
import { showToast } from './utils.js';

export class Wishlist {
    constructor() {
        this.key = 'seasonkart_wishlist';
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.key);
            this.items = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading wishlist:', error);
            this.items = [];
        }
    }

    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving wishlist:', error);
        }
    }

    add(product) {
        if (!this.has(product.id)) {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images,
                category: product.category,
                brand: product.brand,
                rating: product.rating,
                addedAt: new Date().toISOString()
            });
            this.save();
            this.dispatchUpdateEvent();
            return true;
        }
        return false;
    }

    remove(productId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== productId);
        
        if (this.items.length !== initialLength) {
            this.save();
            this.dispatchUpdateEvent();
            return true;
        }
        return false;
    }

    has(productId) {
        return this.items.some(item => item.id === productId);
    }

    clear() {
        this.items = [];
        this.save();
        this.dispatchUpdateEvent();
    }

    getItems() {
        return [...this.items];
    }

    dispatchUpdateEvent() {
        window.dispatchEvent(new CustomEvent('wishlist:updated', {
            detail: { wishlist: this }
        }));
    }
}