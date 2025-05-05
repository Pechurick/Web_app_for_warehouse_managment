import { loadClientData } from './navbar.js';
import { fetchAndDisplayProducts } from './products.js';

export function showCart() {
    const client = loadClientData();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const root = document.getElementById('root');
    root.innerHTML = '<h2>Корзина</h2>';

    if (cart.length === 0) {
        root.innerHTML += '<p>Корзина порожня.</p>';
        return;
    }

    let cartItemsHTML = '';
    cart.forEach((item) => {
        cartItemsHTML += `
            <div class="cart-item">
                <img src="${item.image_url}" width="100px" alt="${item.product_name}" class="product-image">
                <h4>${item.product_name}</h4>
                <p>Кількість: ${item.quantity}</p>
                <button class="remove-item button" data-sku="${item.sku}">Видалити</button>
            </div>
        `;
    });

    root.innerHTML += cartItemsHTML;

    // Додаємо слухачі на кнопки "Видалити"
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const sku = e.target.getAttribute('data-sku');
            removeItemFromCart(sku);
            showCart(); // оновлюємо відображення корзини
        });
    });

    // 🔘 Кнопка "Підтвердити замовлення"
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Підтвердити замовлення';
    confirmButton.classList.add('button');
    confirmButton.addEventListener('click', () =>
        confirmOrder(client.id, cart)
    );
    root.appendChild(confirmButton);
}

export function clearCart() {
    localStorage.removeItem('cart');
}

export function confirmOrder(clientId, cartItems) {
    const orderData = {
        client_id: clientId,
        items: cartItems.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
        })),
    };

    fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(`✅ ${data.message}. Номер замовлення: ${data.order_id}`);
            clearCart(); // якщо ти маєш таку функцію
            fetchAndDisplayProducts(); // або повернення на головну
        })
        .catch((error) => {
            console.error('Помилка створення замовлення:', error);
            alert('❌ Не вдалося створити замовлення. Спробуйте ще раз.');
        });
}

export function removeItemFromCart(sku) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter((item) => item.sku !== sku);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
}
