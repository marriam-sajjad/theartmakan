// Cart logic
let cart = [];
const cartOverlay = document.getElementById('cart-overlay');
const cartSidebar = document.getElementById('cart-sidebar');
const cartIcon = document.getElementById('cart-icon');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElements = document.querySelectorAll('.cart-count');
const totalPriceElement = document.getElementById('total-price');

// Open/Close Cart
cartIcon.addEventListener('click', () => {
    document.body.classList.add('cart-active');
});

closeCartBtn.addEventListener('click', () => {
    document.body.classList.remove('cart-active');
});

cartOverlay.addEventListener('click', () => {
    document.body.classList.remove('cart-active');
});

// Add to Cart Function
function addToCart(name, price, image) {
    // Prevent event from bubbling to parent if called from button inside a card
    if(event) event.stopPropagation();
    
    // Check if item exists
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    
    updateCartUI();
    
    // UI Feedback
    if(event && event.target.classList.contains('add-to-cart-btn')) {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = 'Added!';
        btn.style.backgroundColor = 'var(--primary-color)';
        btn.style.color = 'white';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = 'transparent';
            btn.style.color = 'var(--primary-color)';
        }, 1500);
    }

    // Open cart automatically
    document.body.classList.add('cart-active');
}

// Remove from cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartUI();
}

// Update UI
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                    <span class="remove-item" onclick="removeFromCart('${item.name}')"><i class="fas fa-trash"></i> Remove</span>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    cartCountElements.forEach(el => el.innerText = count);
    totalPriceElement.innerText = '$' + total.toFixed(2);
}

// Form Submission
function submitForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Sent successfully!';
    btn.style.backgroundColor = '#2ecc71';
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = 'var(--secondary-color)';
        e.target.reset();
    }, 3000);
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Init
updateCartUI();
