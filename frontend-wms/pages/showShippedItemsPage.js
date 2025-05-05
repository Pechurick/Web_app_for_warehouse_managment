export async function renderShowShippedItemsPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Перегляд надісланих товарів</h1>
        <div id="output"></div>
    `;

    const response = await fetch('http://localhost:3000/orders/status/shipped');
    const data = await response.json();

    const output = document.getElementById('output');

    data.forEach((order) => {
        const card = document.createElement('div');
        card.classList.add('order-card');
        card.innerHTML = `
            <h3>Заявка #${order.id}</h3>
            <p>Клієнт: ${order.name}</p>
            <p>Email: ${order.email}</p>
            <p>Телефон: ${order.phone}</p>
            <p>Дата замовлення: ${new Date(
                order.order_date
            ).toLocaleString()}</p>
        `;
        card.addEventListener('click', () => {
            renderShippedOrderDetailsPage(order.id);
        });
        output.appendChild(card);
    });
}

export async function renderShippedOrderDetailsPage(orderId) {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Товари заявки #${orderId}</h1>
        <button id="back-button" class="back-button">← Назад до заявок</button>
        <div id="details-output"></div>
    `;

    // Кнопка назад
    document.getElementById('back-button').addEventListener('click', () => {
        renderShowShippedItemsPage();
    });

    const response = await fetch(
        `http://localhost:3000/ship-item/order/${orderId}`
    );
    const items = await response.json();

    const container = document.getElementById('details-output');

    items.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${item.image_url}" alt="${
            item.name
        }" class="product-image">
            <h3>${item.name}</h3>
            <p><strong>SKU:</strong> ${item.sku}</p>
            <p><strong>Кількість:</strong> ${item.quantity}</p>
            <p><strong>Локація:</strong> ${item.zone}${item.x}.${item.y}.${
            item.z
        }</p>
            <p><strong>Дата:</strong> ${new Date(
                item.created_at
            ).toLocaleString()}</p>
        `;
        container.appendChild(card);
    });
}
