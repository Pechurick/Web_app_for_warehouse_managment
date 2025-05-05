export function addToCart(product, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find((item) => item.sku === product.sku);
    const maxAvailable = product.total_quantity;

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= maxAvailable) {
            existingItem.quantity = newQuantity;
        } else {
            alert(`Неможливо додати більше, ніж ${maxAvailable} одиниць.`);
            return;
        }
    } else {
        if (quantity <= maxAvailable) {
            cart.push({ ...product, quantity });
        } else {
            alert(`Неможливо додати більше, ніж ${maxAvailable} одиниць.`);
            return;
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Додано до корзини: ${product.product_name} (x${quantity})`);
}

export function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.product_name}" class="product-image">
        <h3>${product.product_name}</h3>
        <p><strong>SKU:</strong> ${product.sku}</p>
        <p><strong>Опис:</strong> ${product.description}</p>
        <p><strong>Категорія:</strong> ${product.category}</p>
        <p><strong>Кількість на складі:</strong> ${product.total_quantity}</p>
        <input type="number" min="1" max="${product.total_quantity}" value="1" class="quantity-input" />
        <button class="add-to-cart button" data-sku="${product.sku}">Додати в корзину</button>
    `;

    const button = card.querySelector('.add-to-cart');
    const input = card.querySelector('.quantity-input');
    button.addEventListener('click', () => {
        const quantity = parseInt(input.value);
        if (!isNaN(quantity) && quantity > 0) {
            addToCart(product, quantity);
        } else {
            alert('Будь ласка, введіть коректну кількість.');
        }
    });

    return card;
}

export function showProductList(products) {
    const root = document.getElementById('root');
    root.innerHTML = ''; // Очищаємо корінь

    const productList = document.createElement('div');
    productList.classList.add('product-list');

    products.forEach((product) => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });

    root.appendChild(productList);
}

export function fetchAndDisplayProducts() {
    fetch('http://localhost:3000/placed-items/public')
        .then((response) => response.json()) // Парсимо JSON
        .then((data) => {
            showProductList(data);
        })
        .catch((error) => {
            console.error('Помилка:', error);
        });
}
