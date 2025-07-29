async function loadTemplates() {
    const food_response = await fetch('templates/food-items.html');
    const cart_response = await fetch('templates/cart-items.html');

    const food_html = await food_response.text();
    const cart_html = await cart_response.text();

    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = food_html + cart_html;
    document.body.appendChild(templateContainer); // Now templates are available in DOM
}

// Step 2: Fetch data.json
async function loadData() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}

async function init() {
    await loadTemplates();
    let data = await loadData();
    data = data.map(item => ({
        ...item,
        quantity: 0
    }));
    return data;
}

const data = await init();
let cartItems = [];

const foodItems = document.getElementById('food-items');
const foodItemTemplate = document.getElementById('food-item');
const addButtonTemplate = document.getElementById('add-button-template');
const plusMinusTemplate = document.getElementById('plus-minus-template');
const imageTemplate = document.getElementById('image-template');

function createFoodItem(id, category, name, price, image) {
    const clone = foodItemTemplate.content.cloneNode(true);
    clone.querySelector('.category').textContent = category;
    clone.querySelector('.name').textContent = name;
    clone.querySelector('.price').textContent = `$${price.toFixed(2)}`;

    const imageContainer = clone.querySelector('.image-container');

    if(data[id].quantity > 0) {
        createImageElement(imageContainer, image);
        createPlusMinus(imageContainer, id);
        console.log("grmwopdl");
    }
    else {
        createAddButton(imageContainer, image, id);

    }
    
    return clone;
}

function createImageElement(imageContainer, image) {
    const imageClone = imageTemplate.content.cloneNode(true);
    const img = imageClone.querySelector("img");
    img.src = image;
    imageContainer.appendChild(imageClone);
}

function createAddButton(imageContainer, image, id) {
    const buttonClone = addButtonTemplate.content.cloneNode(true);
    const button = buttonClone.querySelector("button");

    createImageElement(imageContainer, image);
    
    button.addEventListener("click", () => {
        imageContainer.innerHTML = "";
        createImageElement(imageContainer, image);
        createPlusMinus(imageContainer, id);
    });

    imageContainer.appendChild(buttonClone);
}

function createPlusMinus(imageContainer, id) {
    const plusMinusClone = plusMinusTemplate.content.cloneNode(true);
    const container = plusMinusClone.querySelector("div");
    
    const minusBtn = container.querySelector(".minus");
    const plusBtn = container.querySelector(".plus");
    const quantityText = container.querySelector("div p");
    
    if (!cartItems.includes(id)) {
        data[id].quantity++;
        cartItems.push(id);
    }

    quantityText.textContent = data[id].quantity;

    minusBtn.addEventListener("click", () => {
        if (data[id].quantity > 1) {
            data[id].quantity--;
            quantityText.textContent = data[id].quantity;
        } else if (data[id].quantity === 1) {
            data[id].quantity = 0;
            quantityText.textContent = data[id].quantity;
            cartItems = cartItems.filter(itemId => itemId !== id);
        }
        renderCartItems();
    });

    plusBtn.addEventListener("click", () => {
        data[id].quantity++;
        quantityText.textContent = data[id].quantity;
        if (!cartItems.includes(id))
            cartItems.push(id);
        renderCartItems();
    });
    renderCartItems();

    imageContainer.appendChild(plusMinusClone);
}

function renderFoodItems() {
    const foodItems = document.getElementById('food-items');
    foodItems.innerHTML = '';
    data.forEach((item, index) => {
        const foodItem = createFoodItem(
            index,
            item.category,
            item.name,
            item.price,
            item.image.desktop
        )
        foodItems.appendChild(foodItem);
    });
}

renderFoodItems();

const cartList = document.getElementById('cart-list');
const cartHeader = document.getElementById("cart-header");
const emptyCartTemplate = document.getElementById('empty-cart-template');
const orderTemplate = document.getElementById('order-template');
const cartItemTemplate = document.getElementById('cart-item-template');
const confirmPopup = document.getElementById('confirm');

function createCartItem(id, category, name, price, image) {
    const clone = cartItemTemplate.content.cloneNode(true);
    clone.querySelector('.cart-item-content p').textContent = name;
    clone.querySelector('.cart-item-content span.quantity').textContent = data[id].quantity;
    clone.querySelector('.cart-item-content span.per-item').textContent = `$${price.toFixed(2)}`;
    clone.querySelector('.cart-item-content span.tot-item').textContent = `$${(price * data[id].quantity).toFixed(2)}`;

    const removeButton = clone.querySelector('button');

    removeButton.addEventListener('click', () => {
        data[id].quantity = 0;
        cartItems = cartItems.filter(itemId => itemId !== id);
        renderCartItems();
        renderFoodItems();
    });

    return clone;
}

function renderCartItems() {
    cartList.innerHTML = '';
    let total_price = 0; let cart_items_count = 0;
    data.forEach(item => { total_price += item.quantity * item.price; cart_items_count += item.quantity; });
    if (cartItems.length === 0) {
        const emptyCart = document.getElementById('empty-cart');
        const clone = emptyCartTemplate.content.cloneNode(true);
        emptyCart.appendChild(clone);
    } else {
        const emptyCart = document.getElementById('empty-cart');
        emptyCart.innerHTML = '';
        cartItems.forEach(id => {
            const item = data[id];
            if (item.quantity > 0) {
                const cartItem = createCartItem(
                    id,
                    item.category,
                    item.name,
                    item.price,
                    item.image.desktop
                );
                cartList.appendChild(cartItem);
            }
        });
        const orderClone = orderTemplate.content.cloneNode(true);
        const confirmOrderButton = orderClone.querySelector("button");
        confirmOrderButton.addEventListener('click', () => { confirmPopup.classList.remove("z-[-50]") });
        const totalCheckoutPrice = orderClone.querySelector(".order-price p.checkout-price");
        totalCheckoutPrice.textContent = `$${total_price.toFixed(2)}`;
        cartList.appendChild(orderClone);
    }
    cartHeader.textContent = `Your Cart (${cart_items_count})`;
}

renderCartItems();
