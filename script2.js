// Main Application Entry Point
import { products, categories } from './data.js';
import { Cart } from './cart.js';
import { Wishlist } from './wishlist.js';
import { Compare } from './compare.js';
import { initAnimations } from './animations.js';
import { initSearch } from './search.js';
import { showToast } from './utils.js';

class SeasonKartApp {
    constructor() {
        this.cart = new Cart();
        this.wishlist = new Wishlist();
        this.compare = new Compare();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.initTheme();
        this.initNavigation();
        this.initComponents();
        this.initEventListeners();
        initAnimations();
        initSearch();
        this.updateCartCount();
        this.updateWishlistCount();
        this.updateCompareCount();
        
        // Load content based on page
        this.loadPageContent();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen')?.classList.add('hidden');
        }, 1000);
    }

    initTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        showToast('Theme updated!', 'info');
    }

    initNavigation() {
        // Mega menu toggle
        const menuTrigger = document.getElementById('menuTrigger');
        const megaMenu = document.getElementById('megaMenu');
        
        if (menuTrigger && megaMenu) {
            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = menuTrigger.getAttribute('aria-expanded') === 'true';
                menuTrigger.setAttribute('aria-expanded', !isExpanded);
                megaMenu.classList.toggle('active');
            });

            // Close mega menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!megaMenu.contains(e.target) && !menuTrigger.contains(e.target)) {
                    menuTrigger.setAttribute('aria-expanded', 'false');
                    megaMenu.classList.remove('active');
                }
            });
        }

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const navActions = document.querySelector('.nav-actions');
        
        if (mobileToggle && navActions) {
            mobileToggle.addEventListener('click', () => {
                navActions.classList.toggle('active');
            });
        }

        // Cart drawer
        const cartAction = document.getElementById('cartAction');
        const cartDrawer = document.getElementById('cartDrawer');
        const cartClose = document.getElementById('cartClose');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartAction && cartDrawer) {
            cartAction.addEventListener('click', () => {
                cartDrawer.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            
            const closeCart = () => {
                cartDrawer.classList.remove('active');
                document.body.style.overflow = '';
            };
            
            if (cartClose) cartClose.addEventListener('click', closeCart);
            if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initComponents() {
        // Initialize quantity inputs
        document.querySelectorAll('.quantity-input').forEach(input => {
            const minusBtn = input.querySelector('.quantity-btn:first-child');
            const plusBtn = input.querySelector('.quantity-btn:last-child');
            const inputField = input.querySelector('input');
            
            minusBtn?.addEventListener('click', () => {
                const currentValue = parseInt(inputField.value) || 1;
                if (currentValue > 1) {
                    inputField.value = currentValue - 1;
                    inputField.dispatchEvent(new Event('change'));
                }
            });
            
            plusBtn?.addEventListener('click', () => {
                const currentValue = parseInt(inputField.value) || 1;
                inputField.value = currentValue + 1;
                inputField.dispatchEvent(new Event('change'));
            });
        });

        // Initialize tooltips
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-element';
                tooltip.textContent = el.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);
                
                const rect = el.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = (rect.top - 40) + 'px';
                tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                
                el.tooltip = tooltip;
            });
            
            el.addEventListener('mouseleave', () => {
                if (el.tooltip) {
                    el.tooltip.remove();
                    delete el.tooltip;
                }
            });
        });
    }

    initEventListeners() {
        // Wishlist button
        const wishlistAction = document.getElementById('wishlistAction');
        if (wishlistAction) {
            wishlistAction.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'pages/wishlist.html';
            });
        }

        // Compare button
        const compareAction = document.getElementById('compareAction');
        if (compareAction) {
            compareAction.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'pages/compare.html';
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                if (email) {
                    showToast('Thank you for subscribing!', 'success');
                    newsletterForm.reset();
                }
            });
        }

        // Countdown timer
        this.initCountdown();
    }

    initCountdown() {
        const countdown = document.getElementById('countdown');
        if (!countdown) return;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7 days from now

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endDate - now;

            if (distance < 0) {
                countdown.innerHTML = '<span class="promo-ended">Sale Ended</span>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days')?.textContent = days.toString().padStart(2, '0');
            document.getElementById('hours')?.textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes')?.textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds')?.textContent = seconds.toString().padStart(2, '0');
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    loadPageContent() {
        // Home page specific
        if (document.querySelector('.categories-section')) {
            this.loadCategories();
            this.loadFeaturedProducts();
        }

        // Shop page
        if (document.querySelector('.shop-page')) {
            this.loadShopProducts();
            this.initFilters();
        }

        // Product page
        if (document.querySelector('.product-details')) {
            this.loadProductDetails();
        }

        // Cart page
        if (document.querySelector('.cart-page')) {
            this.loadCartPage();
        }

        // Checkout page
        if (document.querySelector('.checkout-page')) {
            this.loadCheckoutPage();
        }

        // Wishlist page
        if (document.querySelector('.wishlist-page')) {
            this.loadWishlistPage();
        }

        // Compare page
        if (document.querySelector('.compare-page')) {
            this.loadComparePage();
        }

        // FAQ page
        if (document.querySelector('.faq-section')) {
            this.loadFAQ();
        }

        // Blog page
        if (document.querySelector('.blog-section')) {
            this.loadBlogPosts();
        }
    }

    loadCategories() {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <a href="pages/category.html?cat=${category.slug}" class="category-card" data-aos="fade-up">
                <div class="category-image">
                    <img src="${category.image}" alt="${category.name}" loading="lazy">
                    <div class="category-overlay"></div>
                    <div class="category-icon">
                        <i class="${category.icon}"></i>
                    </div>
                </div>
                <div class="category-content">
                    <h3 class="category-title">${category.name}</h3>
                    <span class="category-count">${category.productCount} Products</span>
                </div>
            </a>
        `).join('');
    }

    loadFeaturedProducts() {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        const featured = products.slice(0, 8);
        container.innerHTML = featured.map(product => this.renderProductCard(product)).join('');

        // Add event listeners to product cards
        this.initProductCardEvents();
    }

    renderProductCard(product) {
        const discountBadge = product.discount > 0 ? 
            `<span class="product-badge">-${product.discount}%</span>` : '';
        
        const ratingStars = Array(5).fill(0).map((_, i) => 
            `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : '-half-alt'}"></i>`
        ).join('');

        return `
            <div class="product-card" data-id="${product.id}" data-aos="fade-up">
                ${discountBadge}
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    <div class="product-actions">
                        <button class="action-btn quick-view-btn" title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn wishlist-btn ${this.wishlist.has(product.id) ? 'active' : ''}" 
                                title="Add to Wishlist">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn compare-btn" title="Add to Compare">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="product-content">
                    <h3 class="product-title">
                        <a href="pages/product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="product-price">
                        <span class="price-current">৳${product.price.toLocaleString()}</span>
                        ${product.oldPrice > 0 ? 
                            `<span class="price-old">৳${product.oldPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <div class="rating-stars">
                            ${ratingStars}
                        </div>
                        <span class="rating-count">(${product.reviewCount})</span>
                    </div>
                    <button class="btn btn-primary btn-block add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }

    initProductCardEvents() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const productId = parseInt(productCard.dataset.id);
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    this.cart.add(product, 1);
                    this.updateCartCount();
                    showToast('Added to cart!', 'success');
                    
                    // Fly to cart animation
                    this.createFlyToCartAnimation(e.target, productCard);
                }
            });
        });

        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productCard = e.target.closest('.product-card');
                const productId = parseInt(productCard.dataset.id);
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    if (this.wishlist.has(productId)) {
                        this.wishlist.remove(productId);
                        btn.classList.remove('active');
                        showToast('Removed from wishlist', 'info');
                    } else {
                        this.wishlist.add(product);
                        btn.classList.add('active');
                        showToast('Added to wishlist!', 'success');
                    }
                    this.updateWishlistCount();
                }
            });
        });

        // Quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productCard = e.target.closest('.product-card');
                const productId = parseInt(productCard.dataset.id);
                this.showQuickView(productId);
            });
        });

        // Compare buttons
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productCard = e.target.closest('.product-card');
                const productId = parseInt(productCard.dataset.id);
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    if (this.compare.has(productId)) {
                        this.compare.remove(productId);
                        showToast('Removed from compare', 'info');
                    } else {
                        if (this.compare.items.length >= 4) {
                            showToast('Maximum 4 products can be compared', 'error');
                            return;
                        }
                        this.compare.add(product);
                        showToast('Added to compare!', 'success');
                    }
                    this.updateCompareCount();
                }
            });
        });
    }

    createFlyToCartAnimation(button, productCard) {
        const cartIcon = document.querySelector('.cart-action');
        if (!cartIcon) return;

        const buttonRect = button.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const flyElement = document.createElement('div');
        flyElement.className = 'fly-to-cart';
        flyElement.style.cssText = `
            position: fixed;
            left: ${buttonRect.left + buttonRect.width / 2}px;
            top: ${buttonRect.top + buttonRect.height / 2}px;
            width: 20px;
            height: 20px;
            background-color: var(--color-primary);
            border-radius: 50%;
            z-index: 9999;
            pointer-events: none;
        `;

        // Calculate animation coordinates
        const tx = cartRect.left + cartRect.width / 2 - (buttonRect.left + buttonRect.width / 2);
        const ty = cartRect.top + cartRect.height / 2 - (buttonRect.top + buttonRect.height / 2);

        flyElement.style.setProperty('--tx', `${tx}px`);
        flyElement.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(flyElement);

        setTimeout(() => {
            flyElement.remove();
        }, 1000);
    }

    showQuickView(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('quickViewModal');
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="quickview-content">
                <div class="quickview-images">
                    <div class="main-image">
                        <img src="${product.images[0]}" alt="${product.name}">
                    </div>
                </div>
                <div class="quickview-details">
                    <h2 class="product-title">${product.name}</h2>
                    <div class="product-price">
                        <span class="price-current">৳${product.price.toLocaleString()}</span>
                        ${product.oldPrice > 0 ? 
                            `<span class="price-old">৳${product.oldPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <div class="rating-stars">
                            ${Array(5).fill(0).map((_, i) => 
                                `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : '-half-alt'}"></i>`
                            ).join('')}
                        </div>
                        <span class="rating-count">${product.rating} (${product.reviewCount} reviews)</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-variants">
                        <div class="variant-group">
                            <label>Color:</label>
                            <div class="variant-options">
                                ${product.colors.map(color => `
                                    <button class="variant-option" data-value="${color}">${color}</button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="variant-group">
                            <label>Size:</label>
                            <div class="variant-options">
                                ${product.sizes.map(size => `
                                    <button class="variant-option" data-value="${size}">${size}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <div class="quantity-input">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" value="1" min="1" max="10">
                            <button class="quantity-btn plus">+</button>
                        </div>
                        <button class="btn btn-primary add-to-cart-quick">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="btn btn-outline wishlist-quick ${this.wishlist.has(product.id) ? 'active' : ''}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Close modal events
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Add to cart from quick view
        const addToCartBtn = content.querySelector('.add-to-cart-quick');
        addToCartBtn.addEventListener('click', () => {
            this.cart.add(product, 1);
            this.updateCartCount();
            showToast('Added to cart!', 'success');
            closeModal();
        });

        // Wishlist from quick view
        const wishlistBtn = content.querySelector('.wishlist-quick');
        wishlistBtn.addEventListener('click', () => {
            if (this.wishlist.has(product.id)) {
                this.wishlist.remove(product.id);
                wishlistBtn.classList.remove('active');
                showToast('Removed from wishlist', 'info');
            } else {
                this.wishlist.add(product);
                wishlistBtn.classList.add('active');
                showToast('Added to wishlist!', 'success');
            }
            this.updateWishlistCount();
        });
    }

    updateCartCount() {
        const count = this.cart.getTotalItems();
        const badge = document.getElementById('cartCount');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        
        // Update cart drawer if open
        this.updateCartDrawer();
    }

    updateWishlistCount() {
        const count = this.wishlist.items.length;
        const badge = document.getElementById('wishlistCount');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateCompareCount() {
        const count = this.compare.items.length;
        const badge = document.getElementById('compareCount');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateCartDrawer() {
        const cartBody = document.getElementById('cartBody');
        const emptyCart = document.getElementById('emptyCart');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartBody || !emptyCart) return;
        
        const cartItems = this.cart.getItems();
        
        if (cartItems.length === 0) {
            cartBody.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="pages/shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }
        
        let subtotal = 0;
        const itemsHTML = cartItems.map(item => {
            const itemTotal = item.product.price * item.quantity;
            subtotal += itemTotal;
            
            return `
                <div class="cart-item" data-id="${item.product.id}">
                    <div class="cart-item-image">
                        <img src="${item.product.images[0]}" alt="${item.product.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.product.name}</h4>
                        <div class="cart-item-price">৳${item.product.price.toLocaleString()}</div>
                        <div class="cart-item-quantity">
                            <div class="quantity-input">
                                <button class="quantity-btn minus">-</button>
                                <input type="number" value="${item.quantity}" min="1" max="10">
                                <button class="quantity-btn plus">+</button>
                            </div>
                            <button class="cart-item-remove">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        cartBody.innerHTML = itemsHTML;
        
        if (cartSubtotal) cartSubtotal.textContent = `৳${subtotal.toLocaleString()}`;
        if (cartTotal) {
            const shipping = 60;
            const total = subtotal + shipping;
            cartTotal.textContent = `৳${total.toLocaleString()}`;
        }
        
        // Add event listeners to cart items
        this.initCartItemEvents();
    }

    initCartItemEvents() {
        // Quantity changes
        document.querySelectorAll('.cart-item .quantity-input').forEach(input => {
            const minusBtn = input.querySelector('.minus');
            const plusBtn = input.querySelector('.plus');
            const inputField = input.querySelector('input');
            const cartItem = input.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            
            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(inputField.value) || 1;
                if (currentValue > 1) {
                    this.cart.updateQuantity(productId, currentValue - 1);
                    inputField.value = currentValue - 1;
                    this.updateCartCount();
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(inputField.value) || 1;
                this.cart.updateQuantity(productId, currentValue + 1);
                inputField.value = currentValue + 1;
                this.updateCartCount();
            });
            
            inputField.addEventListener('change', () => {
                const value = parseInt(inputField.value) || 1;
                this.cart.updateQuantity(productId, value);
                this.updateCartCount();
            });
        });
        
        // Remove items
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartItem = btn.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                this.cart.remove(productId);
                this.updateCartCount();
                showToast('Item removed from cart', 'info');
            });
        });
    }

    loadShopProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        container.innerHTML = products.map(product => this.renderProductCard(product)).join('');
        this.initProductCardEvents();
    }

    initFilters() {
        // Price range slider
        const priceSlider = document.getElementById('priceRange');
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        
        if (priceSlider && priceMin && priceMax) {
            const minPrice = 0;
            const maxPrice = Math.max(...products.map(p => p.price));
            
            priceSlider.min = minPrice;
            priceSlider.max = maxPrice;
            priceSlider.value = maxPrice;
            priceMax.textContent = `৳${maxPrice.toLocaleString()}`;
            
            priceSlider.addEventListener('input', () => {
                const value = parseInt(priceSlider.value);
                priceMax.textContent = `৳${value.toLocaleString()}`;
                this.filterProducts();
            });
        }
        
        // Category filter
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('change', () => this.filterProducts());
        });
        
        // Rating filter
        document.querySelectorAll('.rating-filter').forEach(filter => {
            filter.addEventListener('change', () => this.filterProducts());
        });
        
        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.filterProducts());
        }
    }

    filterProducts() {
        // Get filter values
        const priceRange = parseInt(document.getElementById('priceRange')?.value) || Infinity;
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(cb => cb.value);
        const minRating = Array.from(document.querySelectorAll('.rating-filter:checked'))
            .map(cb => parseFloat(cb.value))
            .reduce((max, rating) => Math.max(max, rating), 0);
        const sortBy = document.getElementById('sortSelect')?.value || 'default';
        
        // Filter products
        let filteredProducts = [...products];
        
        if (priceRange < Infinity) {
            filteredProducts = filteredProducts.filter(p => p.price <= priceRange);
        }
        
        if (selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter(p => 
                selectedCategories.includes(p.category)
            );
        }
        
        if (minRating > 0) {
            filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
        }
        
        // Sort products
        switch (sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                filteredProducts.reverse();
                break;
        }
        
        // Update product grid
        const container = document.getElementById('productsGrid');
        if (container) {
            container.innerHTML = filteredProducts.map(product => 
                this.renderProductCard(product)
            ).join('');
            this.initProductCardEvents();
            
            // Update product count
            const productCount = document.getElementById('productCount');
            if (productCount) {
                productCount.textContent = `${filteredProducts.length} products found`;
            }
        }
    }

    loadProductDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        
        if (!productId) return;
        
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Update page title
        document.title = `${product.name} | SeasonKart BD`;
        
        // Render product details
        const container = document.querySelector('.product-details');
        if (container) {
            container.innerHTML = this.renderProductDetails(product);
            this.initProductDetailsEvents(product);
        }
    }

    renderProductDetails(product) {
        const discountBadge = product.discount > 0 ? 
            `<span class="product-badge">-${product.discount}%</span>` : '';
        
        const ratingStars = Array(5).fill(0).map((_, i) => 
            `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : '-half-alt'}"></i>`
        ).join('');
        
        return `
            <div class="product-detail-container">
                <div class="product-images">
                    <div class="main-image">
                        <img src="${product.images[0]}" alt="${product.name}" id="mainProductImage">
                    </div>
                    <div class="thumbnail-images">
                        ${product.images.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${img}">
                                <img src="${img}" alt="${product.name} - View ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="product-info">
                    ${discountBadge}
                    <h1 class="product-title">${product.name}</h1>
                    
                    <div class="product-meta">
                        <div class="product-rating">
                            <div class="rating-stars">
                                ${ratingStars}
                            </div>
                            <span class="rating-value">${product.rating}</span>
                            <span class="rating-count">(${product.reviewCount} reviews)</span>
                        </div>
                        <div class="product-sku">
                            SKU: SKBD-${product.id.toString().padStart(4, '0')}
                        </div>
                        <div class="product-availability ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                            <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            ${product.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                    </div>
                    
                    <div class="product-price">
                        <span class="price-current">৳${product.price.toLocaleString()}</span>
                        ${product.oldPrice > 0 ? 
                            `<span class="price-old">৳${product.oldPrice.toLocaleString()}</span>` : ''}
                    </div>
                    
                    <div class="product-description">
                        <p>${product.description}</p>
                    </div>
                    
                    ${this.renderProductVariants(product)}
                    
                    <div class="product-actions">
                        <div class="quantity-input">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" value="1" min="1" max="10" id="productQuantity">
                            <button class="quantity-btn plus">+</button>
                        </div>
                        
                        <button class="btn btn-primary btn-lg add-to-cart-detail" ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        
                        <button class="btn btn-outline wishlist-detail ${this.wishlist.has(product.id) ? 'active' : ''}">
                            <i class="fas fa-heart"></i>
                        </button>
                        
                        <button class="btn btn-outline compare-detail">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>
                    
                    <div class="product-features">
                        <h3>Key Features</h3>
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="product-share">
                        <span>Share:</span>
                        <div class="share-buttons">
                            <a href="#" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="share-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
                            <a href="#" class="share-btn pinterest"><i class="fab fa-pinterest-p"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="product-tabs">
                <div class="tab-headers">
                    <button class="tab-header active" data-tab="description">Description</button>
                    <button class="tab-header" data-tab="features">Features</button>
                    <button class="tab-header" data-tab="reviews">Reviews (${product.reviewCount})</button>
                    <button class="tab-header" data-tab="shipping">Shipping & Returns</button>
                </div>
                
                <div class="tab-contents">
                    <div class="tab-content active" id="description">
                        <p>${product.description}</p>
                        <p>This premium product offers exceptional quality and performance, designed to meet the highest standards.</p>
                    </div>
                    
                    <div class="tab-content" id="features">
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="tab-content" id="reviews">
                        <div class="review-summary">
                            <div class="average-rating">
                                <h3>${product.rating}</h3>
                                <div class="rating-stars">
                                    ${ratingStars}
                                </div>
                                <p>Based on ${product.reviewCount} reviews</p>
                            </div>
                            <div class="rating-bars">
                                <!-- Rating distribution bars would go here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="shipping">
                        <h3>Shipping Information</h3>
                        <p>We offer free standard shipping on orders over ৳999 in Dhaka & Chattogram. Delivery typically takes 3-5 business days.</p>
                        
                        <h3>Return Policy</h3>
                        <p>We offer a 14-day return policy for most products. Items must be unused, in original packaging, and with all accessories included.</p>
                    </div>
                </div>
            </div>
            
            <div class="related-products">
                <h2>You May Also Like</h2>
                <div class="related-products-grid" id="relatedProducts">
                    <!-- Related products loaded via JS -->
                </div>
            </div>
        `;
    }

    renderProductVariants(product) {
        let html = '';
        
        if (product.colors && product.colors.length > 0) {
            html += `
                <div class="product-variant">
                    <label>Color:</label>
                    <div class="variant-options">
                        ${product.colors.map((color, index) => `
                            <button class="variant-option ${index === 0 ? 'active' : ''}" 
                                    data-value="${color}"
                                    style="background-color: ${this.getColorHex(color)}">
                                <span class="variant-label">${color}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (product.sizes && product.sizes.length > 0) {
            html += `
                <div class="product-variant">
                    <label>Size:</label>
                    <div class="variant-options">
                        ${product.sizes.map((size, index) => `
                            <button class="variant-option ${index === 0 ? 'active' : ''}" 
                                    data-value="${size}">
                                ${size}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return html ? `<div class="product-variants">${html}</div>` : '';
    }

    getColorHex(colorName) {
        const colors = {
            'Deep Purple': '#5D3FD3',
            'Gold': '#FFD700',
            'Silver': '#C0C0C0',
            'Space Black': '#1A1A1A',
            'Phantom Black': '#1A1A1A',
            'Cream': '#FFFDD0',
            'Green': '#008000',
            'Lavender': '#E6E6FA',
            'Black': '#000000',
            'Red': '#FF0000',
            'Blue': '#0000FF',
            'Midnight': '#1A1A1A',
            'Starlight': '#F5F5F5',
            'Yellow': '#FFFF00'
        };
        
        return colors[colorName] || '#CCCCCC';
    }

    initProductDetailsEvents(product) {
        // Image thumbnail clicks
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const mainImage = document.getElementById('mainProductImage');
                const imageUrl = thumb.dataset.image;
                
                if (mainImage && imageUrl) {
                    // Add fade out effect
                    mainImage.style.opacity = '0';
                    
                    setTimeout(() => {
                        mainImage.src = imageUrl;
                        mainImage.style.opacity = '1';
                    }, 200);
                    
                    // Update active thumbnail
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                }
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tab-header').forEach(header => {
            header.addEventListener('click', () => {
                const tabId = header.dataset.tab;
                
                // Update active tab header
                document.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
                header.classList.add('active');
                
                // Show corresponding tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId)?.classList.add('active');
            });
        });
        
        // Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-detail');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('productQuantity')?.value) || 1;
                this.cart.add(product, quantity);
                this.updateCartCount();
                showToast('Added to cart!', 'success');
            });
        }
        
        // Wishlist button
        const wishlistBtn = document.querySelector('.wishlist-detail');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                if (this.wishlist.has(product.id)) {
                    this.wishlist.remove(product.id);
                    wishlistBtn.classList.remove('active');
                    showToast('Removed from wishlist', 'info');
                } else {
                    this.wishlist.add(product);
                    wishlistBtn.classList.add('active');
                    showToast('Added to wishlist!', 'success');
                }
                this.updateWishlistCount();
            });
        }
        
        // Compare button
        const compareBtn = document.querySelector('.compare-detail');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                if (this.compare.has(product.id)) {
                    this.compare.remove(product.id);
                    showToast('Removed from compare', 'info');
                } else {
                    if (this.compare.items.length >= 4) {
                        showToast('Maximum 4 products can be compared', 'error');
                        return;
                    }
                    this.compare.add(product);
                    showToast('Added to compare!', 'success');
                }
                this.updateCompareCount();
            });
        }
        
        // Load related products
        this.loadRelatedProducts(product);
    }

    loadRelatedProducts(product) {
        const container = document.getElementById('relatedProducts');
        if (!container) return;
        
        // Find products from same category
        const related = products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
        
        if (related.length > 0) {
            container.innerHTML = related.map(p => this.renderProductCard(p)).join('');
            this.initProductCardEvents();
        } else {
            container.innerHTML = '<p>No related products found.</p>';
        }
    }

    loadCartPage() {
        this.updateCartPage();
    }

    updateCartPage() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSummary = document.querySelector('.cart-summary');
        
        if (!cartItemsContainer || !cartSummary) return;
        
        const cartItems = this.cart.getItems();
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <a href="pages/shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            cartSummary.style.display = 'none';
            return;
        }
        
        cartSummary.style.display = 'block';
        
        let subtotal = 0;
        cartItemsContainer.innerHTML = cartItems.map(item => {
            const itemTotal = item.product.price * item.quantity;
            subtotal += itemTotal;
            
            return `
                <div class="cart-page-item" data-id="${item.product.id}">
                    <div class="item-image">
                        <img src="${item.product.images[0]}" alt="${item.product.name}">
                    </div>
                    <div class="item-details">
                        <h4 class="item-title">
                            <a href="pages/product.html?id=${item.product.id}">${item.product.name}</a>
                        </h4>
                        <div class="item-meta">
                            <span class="item-brand">${item.product.brand}</span>
                            <span class="item-category">${item.product.category}</span>
                        </div>
                        <div class="item-price">৳${item.product.price.toLocaleString()}</div>
                    </div>
                    <div class="item-quantity">
                        <div class="quantity-input">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" value="${item.quantity}" min="1" max="10">
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    <div class="item-total">৳${itemTotal.toLocaleString()}</div>
                    <div class="item-actions">
                        <button class="btn btn-icon remove-item">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-icon move-to-wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update summary
        const shipping = 60;
        const total = subtotal + shipping;
        
        document.getElementById('cartSubtotalValue')?.textContent = `৳${subtotal.toLocaleString()}`;
        document.getElementById('cartShippingValue')?.textContent = `৳${shipping.toLocaleString()}`;
        document.getElementById('cartTotalValue')?.textContent = `৳${total.toLocaleString()}`;
        
        // Add event listeners
        this.initCartPageEvents();
    }

    initCartPageEvents() {
        // Quantity changes
        document.querySelectorAll('.cart-page-item .quantity-input').forEach(input => {
            const minusBtn = input.querySelector('.minus');
            const plusBtn = input.querySelector('.plus');
            const inputField = input.querySelector('input');
            const cartItem = input.closest('.cart-page-item');
            const productId = parseInt(cartItem.dataset.id);
            
            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(inputField.value) || 1;
                if (currentValue > 1) {
                    this.cart.updateQuantity(productId, currentValue - 1);
                    this.updateCartPage();
                    this.updateCartCount();
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(inputField.value) || 1;
                this.cart.updateQuantity(productId, currentValue + 1);
                this.updateCartPage();
                this.updateCartCount();
            });
            
            inputField.addEventListener('change', () => {
                const value = parseInt(inputField.value) || 1;
                this.cart.updateQuantity(productId, value);
                this.updateCartPage();
                this.updateCartCount();
            });
        });
        
        // Remove items
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartItem = btn.closest('.cart-page-item');
                const productId = parseInt(cartItem.dataset.id);
                this.cart.remove(productId);
                this.updateCartPage();
                this.updateCartCount();
                showToast('Item removed from cart', 'info');
            });
        });
        
        // Move to wishlist
        document.querySelectorAll('.move-to-wishlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const cartItem = btn.closest('.cart-page-item');
                const productId = parseInt(cartItem.dataset.id);
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    this.cart.remove(productId);
                    this.wishlist.add(product);
                    this.updateCartPage();
                    this.updateCartCount();
                    this.updateWishlistCount();
                    showToast('Moved to wishlist!', 'success');
                }
            });
        });
        
        // Coupon form
        const couponForm = document.getElementById('couponForm');
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const couponCode = couponForm.querySelector('input').value;
                
                if (couponCode === 'SEASON10') {
                    showToast('Coupon applied! 10% discount added.', 'success');
                } else {
                    showToast('Invalid coupon code', 'error');
                }
            });
        }
        
        // Proceed to checkout
        const checkoutBtn = document.querySelector('.proceed-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.getTotalItems() === 0) {
                    showToast('Your cart is empty', 'error');
                    return;
                }
                window.location.href = 'pages/checkout.html';
            });
        }
    }

    loadCheckoutPage() {
        this.initCheckoutForm();
        this.updateCheckoutSummary();
    }

    initCheckoutForm() {
        const form = document.getElementById('checkoutForm');
        if (!form) return;
        
        // Form validation
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (isValid) {
                this.processOrder();
            } else {
                showToast('Please fill all required fields', 'error');
            }
        });
        
        // Real-time validation
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                if (field.value.trim()) {
                    field.classList.remove('error');
                }
            });
        });
        
        // Shipping method selection
        document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateCheckoutSummary();
            });
        });
        
        // Payment method selection
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
                this.togglePaymentFields(selectedMethod);
            });
        });
    }

    updateCheckoutSummary() {
        const cartItems = this.cart.getItems();
        let subtotal = 0;
        
        cartItems.forEach(item => {
            subtotal += item.product.price * item.quantity;
        });
        
        // Get selected shipping method
        const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked')?.value;
        let shipping = 60; // Default standard shipping
        
        if (shippingMethod === 'express') shipping = 120;
        if (shippingMethod === 'same-day') shipping = 200;
        
        const total = subtotal + shipping;
        
        // Update summary elements
        document.getElementById('summarySubtotal')?.textContent = `৳${subtotal.toLocaleString()}`;
        document.getElementById('summaryShipping')?.textContent = `৳${shipping.toLocaleString()}`;
        document.getElementById('summaryTotal')?.textContent = `৳${total.toLocaleString()}`;
        
        // Update order items
        const itemsContainer = document.getElementById('orderItems');
        if (itemsContainer) {
            itemsContainer.innerHTML = cartItems.map(item => `
                <div class="order-item">
                    <div class="item-name">${item.product.name} × ${item.quantity}</div>
                    <div class="item-price">৳${(item.product.price * item.quantity).toLocaleString()}</div>
                </div>
            `).join('');
        }
    }

    togglePaymentFields(method) {
        // Hide all payment fields first
        document.querySelectorAll('.payment-field').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show fields for selected method
        if (method === 'bkash') {
            document.getElementById('bkashFields')?.style.display = 'block';
        } else if (method === 'card') {
            document.getElementById('cardFields')?.style.display = 'block';
        } else if (method === 'bank') {
            document.getElementById('bankFields')?.style.display = 'block';
        }
    }

    processOrder() {
        const order = {
            id: 'ORD-' + Date.now(),
            date: new Date().toISOString(),
            items: this.cart.getItems(),
            total: this.calculateOrderTotal(),
            status: 'Processing',
            shippingAddress: this.getFormData('shipping'),
            billingAddress: this.getFormData('billing'),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value
        };
        
        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        this.cart.clear();
        this.updateCartCount();
        
        // Show success modal
        this.showOrderSuccessModal(order);
    }

    calculateOrderTotal() {
        const cartItems = this.cart.getItems();
        let subtotal = 0;
        
        cartItems.forEach(item => {
            subtotal += item.product.price * item.quantity;
        });
        
        const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked')?.value;
        let shipping = 60;
        if (shippingMethod === 'express') shipping = 120;
        if (shippingMethod === 'same-day') shipping = 200;
        
        return subtotal + shipping;
    }

    getFormData(prefix) {
        const data = {};
        document.querySelectorAll(`[name^="${prefix}_"]`).forEach(field => {
            const key = field.name.replace(`${prefix}_`, '');
            data[key] = field.value;
        });
        return data;
    }

    showOrderSuccessModal(order) {
        const modal = document.createElement('div');
        modal.className = 'order-success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your purchase. Your order has been received.</p>
                
                <div class="order-details">
                    <div class="detail-row">
                        <span>Order Number:</span>
                        <strong>${order.id}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Date:</span>
                        <span>${new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Total:</span>
                        <strong>৳${order.total.toLocaleString()}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Payment Method:</span>
                        <span>${this.formatPaymentMethod(order.paymentMethod)}</span>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <a href="pages/order-tracking.html?id=${order.id}" class="btn btn-primary">
                        Track Order
                    </a>
                    <a href="pages/shop.html" class="btn btn-outline">
                        Continue Shopping
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal on click outside
        setTimeout(() => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    window.location.href = 'pages/order-tracking.html?id=' + order.id;
                }
            });
        }, 100);
    }

    formatPaymentMethod(method) {
        const methods = {
            'cod': 'Cash on Delivery',
            'bkash': 'bKash',
            'nagad': 'Nagad',
            'card': 'Credit/Debit Card',
            'bank': 'Bank Transfer'
        };
        return methods[method] || method;
    }

    loadWishlistPage() {
        this.updateWishlistPage();
    }

    updateWishlistPage() {
        const container = document.getElementById('wishlistItems');
        if (!container) return;
        
        const wishlistItems = this.wishlist.items;
        
        if (wishlistItems.length === 0) {
            container.innerHTML = `
                <div class="empty-wishlist">
                    <i class="far fa-heart"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Save items you like to your wishlist.</p>
                    <a href="pages/shop.html" class="btn btn-primary">Browse Products</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = wishlistItems.map(product => `
            <div class="wishlist-item" data-id="${product.id}">
                <div class="item-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="item-details">
                    <h4 class="item-title">
                        <a href="pages/product.html?id=${product.id}">${product.name}</a>
                    </h4>
                    <div class="item-price">৳${product.price.toLocaleString()}</div>
                    <div class="item-rating">
                        <div class="rating-stars">
                            ${Array(5).fill(0).map((_, i) => 
                                `<i class="fas fa-star${i < Math.floor(product.rating) ? '' : '-half-alt'}"></i>`
                            ).join('')}
                        </div>
                        <span class="rating-count">(${product.reviewCount})</span>
                    </div>
                    <div class="item-availability ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary add-to-cart-wishlist" ${!product.inStock ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                    <button class="btn btn-icon remove-from-wishlist">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        this.initWishlistEvents();
    }

    initWishlistEvents() {
        // Add to cart from wishlist
        document.querySelectorAll('.add-to-cart-wishlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const wishlistItem = btn.closest('.wishlist-item');
                const productId = parseInt(wishlistItem.dataset.id);
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    this.cart.add(product, 1);
                    this.updateCartCount();
                    showToast('Added to cart!', 'success');
                }
            });
        });
        
        // Remove from wishlist
        document.querySelectorAll('.remove-from-wishlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const wishlistItem = btn.closest('.wishlist-item');
                const productId = parseInt(wishlistItem.dataset.id);
                
                this.wishlist.remove(productId);
                this.updateWishlistPage();
                this.updateWishlistCount();
                showToast('Removed from wishlist', 'info');
            });
        });
    }

    loadComparePage() {
        this.updateComparePage();
    }

    updateComparePage() {
        const container = document.getElementById('compareTable');
        if (!container) return;
        
        const compareItems = this.compare.items;
        
        if (compareItems.length === 0) {
            container.innerHTML = `
                <div class="empty-compare">
                    <i class="fas fa-exchange-alt"></i>
                    <h3>No products to compare</h3>
                    <p>Add products to compare their features.</p>
                    <a href="pages/shop.html" class="btn btn-primary">Browse Products</a>
                </div>
            `;
            return;
        }
        
        // Create comparison table
        const features = [
            'Price',
            'Brand',
            'Rating',
            'Category',
            'In Stock',
            'Warranty',
            'Color Options',
            'Size Options'
        ];
        
        let html = `
            <div class="compare-header">
                <div class="compare-feature">Features</div>
                ${compareItems.map(product => `
                    <div class="compare-product" data-id="${product.id}">
                        <button class="remove-compare">
                            <i class="fas fa-times"></i>
                        </button>
                        <div class="product-image">
                            <img src="${product.images[0]}" alt="${product.name}">
                        </div>
                        <h4 class="product-title">${product.name}</h4>
                        <div class="product-price">৳${product.price.toLocaleString()}</div>
                        <button class="btn btn-primary add-to-cart-compare">
                            Add to Cart
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        features.forEach(feature => {
            html += `
                <div class="compare-row">
                    <div class="compare-feature">${feature}</div>
                    ${compareItems.map(product => `
                        <div class="compare-value" data-id="${product.id}">
                            ${this.getFeatureValue(product, feature)}
                        </div>
                    `).join('')}
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add event listeners
        this.initCompareEvents();
    }

    getFeatureValue(product, feature) {
        switch (feature) {
            case 'Price':
                return `৳${product.price.toLocaleString()}`;
            case 'Brand':
                return product.brand;
            case 'Rating':
                return `${product.rating} (${product.reviewCount} reviews)`;
            case 'Category':
                return product.category;
            case 'In Stock':
                return product.inStock ? 'Yes' : 'No';
            case 'Warranty':
                return '1 Year';
            case 'Color Options':
                return product.colors?.length || 'N/A';
            case 'Size Options':
                return product.sizes?.length || 'N/A';
            default:
                return 'N/A';
        }
    }

    initCompareEvents() {
        // Remove from compare
        document.querySelectorAll('.remove-compare').forEach(btn => {
            btn.addEventListener('click', () => {
                const compareProduct = btn.closest('.compare-product');
                const productId = parseInt(compareProduct.dataset.id);
                
                this.compare.remove(productId);
                this.updateComparePage();
                this.updateCompareCount();
                showToast('Removed from compare', 'info');
            });
        });
        
        // Add to cart from compare
        document.querySelectorAll('.add-to-cart-compare').forEach(btn => {
            btn.addEventListener('click', () => {
                const compareProduct = btn.closest('.compare-product');
                const productId = parseInt(compareProduct.dataset.id);
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    this.cart.add(product, 1);
                    this.updateCartCount();
                    showToast('Added to cart!', 'success');
                }
            });
        });
    }

    loadFAQ() {
        const container = document.getElementById('faqAccordion');
        if (!container) return;
        
        const faqs = [
            {
                question: "What is SeasonKart BD?",
                answer: "SeasonKart BD is Bangladesh's premier online shopping platform offering premium products across various categories including electronics, fashion, home essentials, and more."
            },
            {
                question: "How can I place an order?",
                answer: "You can place an order by browsing our products, adding items to your cart, and proceeding through the secure checkout process."
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept Cash on Delivery, bKash, Nagad, credit/debit cards, and bank transfers."
            },
            {
                question: "How long does delivery take?",
                answer: "Standard delivery takes 3-5 business days. Express and same-day delivery options are available for selected areas."
            },
            {
                question: "What is your return policy?",
                answer: "We offer a 14-day return policy for most products. Items must be unused, in original packaging, and with all accessories included."
            },
            {
                question: "Do you ship internationally?",
                answer: "Currently, we only ship within Bangladesh. We're working on expanding our international shipping options."
            },
            {
                question: "How can I track my order?",
                answer: "You can track your order using the tracking number provided in your order confirmation email or through your account dashboard."
            }
        ];
        
        container.innerHTML = faqs.map((faq, index) => `
            <div class="faq-item ${index === 0 ? 'active' : ''}">
                <div class="faq-question">
                    <h4>${faq.question}</h4>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `).join('');
        
        // Add accordion functionality
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                const isActive = faqItem.classList.contains('active');
                
                // Close all other items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }

    loadBlogPosts() {
        const container = document.getElementById('blogPosts');
        if (!container) return;
        
        const posts = [
            {
                id: 1,
                title: "The Future of E-commerce in Bangladesh",
                excerpt: "How technology is transforming shopping habits and what to expect in 2024",
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                date: "March 15, 2024",
                author: "SeasonKart Team",
                category: "Industry"
            },
            {
                id: 2,
                title: "5 Must-Have Gadgets for 2024",
                excerpt: "Our top picks for the most innovative and useful gadgets this year",
                image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                date: "March 10, 2024",
                author: "Tech Expert",
                category: "Technology"
            },
            {
                id: 3,
                title: "Sustainable Shopping Guide",
                excerpt: "How to make eco-friendly choices while shopping online",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                date: "March 5, 2024",
                author: "Green Living",
                category: "Lifestyle"
            }
        ];
        
        container.innerHTML = posts.map(post => `
            <article class="blog-card" data-aos="fade-up">
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="blog-category">${post.category}</div>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-date">
                            <i class="far fa-calendar"></i>
                            ${post.date}
                        </span>
                        <span class="blog-author">
                            <i class="far fa-user"></i>
                            ${post.author}
                        </span>
                    </div>
                    <h3 class="blog-title">
                        <a href="pages/blog-single.html?id=${post.id}">${post.title}</a>
                    </h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <a href="pages/blog-single.html?id=${post.id}" class="blog-read-more">
                        Read More
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `).join('');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.seasonKartApp = new SeasonKartApp();
});