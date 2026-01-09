// Product Comparison System
export class Compare {
    constructor() {
        this.key = 'seasonkart_compare';
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.key);
            this.items = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading compare:', error);
            this.items = [];
        }
    }

    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving compare:', error);
        }
    }

    add(product) {
        if (!this.has(product.id) && this.items.length < 4) {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images,
                category: product.category,
                brand: product.brand,
                rating: product.rating,
                features: product.features || []
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
        window.dispatchEvent(new CustomEvent('compare:updated', {
            detail: { compare: this }
        }));
    }
}