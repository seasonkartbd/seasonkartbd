// Cart Management System
import { showToast } from './utils.js';

export class Cart {
    constructor() {
        this.key = 'seasonkart_cart';
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.key);
            this.items = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
    }

    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    add(product, quantity = 1) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                    category: product.category,
                    brand: product.brand
                },
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.save();
        this.dispatchUpdateEvent();
    }

    remove(productId) {
        this.items = this.items.filter(item => item.product.id !== productId);
        this.save();
        this.dispatchUpdateEvent();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.product.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.remove(productId);
            } else {
                item.quantity = quantity;
                this.save();
                this.dispatchUpdateEvent();
            }
        }
    }

    clear() {
        this.items = [];
        this.save();
        this.dispatchUpdateEvent();
    }

    getItems() {
        return [...this.items];
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.items.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0
        );
    }

    getTotal(shippingCost = 60) {
        return this.getSubtotal() + shippingCost;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    dispatchUpdateEvent() {
        window.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { cart: this }
        }));
    }
}