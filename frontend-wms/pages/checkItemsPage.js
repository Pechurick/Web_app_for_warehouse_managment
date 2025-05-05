export async function renderCheckItemsPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Контроль товарів за заявками</h1>
        <div id="output">Завантаження...</div>
    `;

    const output = document.getElementById('output');
    try {
        const response = await fetch(
            'http://localhost:3000/orders/status/picked'
        );
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const orders = await response.json();

        if (orders.length === 0) {
            output.innerHTML = `<p>Немає заявок зі статусом <strong>picked</strong>.</p>`;
            return;
        }

        output.innerHTML =
            '<ul>' +
            orders
                .map(
                    (order) => `
                <li style="margin-bottom: 16px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                    <strong>Заявка #${order.id}</strong> — ${new Date(
                        order.order_date
                    ).toLocaleString()}<br>
                    Клієнт: ${order.name} (${order.email}, ${order.phone})<br>
                    <button class="start-pick-btn" data-id="${
                        order.id
                    }">Почати контроль</button>
                </li>
            `
                )
                .join('') +
            '</ul>';

        document.querySelectorAll('.start-pick-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const orderId = btn.dataset.id;
                renderCheckingItemProcessPage(orderId);
            });
        });
    } catch (error) {
        output.innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}

export async function renderCheckingItemProcessPage(id) {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Контроль товарів за заявкою ${id}</h1>
        <div id="slider" class="slider">
            <div id="slide-content" class="slide-content">Завантаження...</div>
        </div>
    `;

    const slideContent = document.getElementById('slide-content');

    try {
        const response = await fetch(
            `http://localhost:3000/pick-item/order/${id}`
        );
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        if (data.length === 0) {
            slideContent.innerHTML = '<p>Немає позицій для контролю.</p>';
            return;
        }

        data.reverse(); // Показати останні першими

        let currentIndex = 0;

        function renderSlide(index) {
            const item = data[index];
            const loc = `${item.zone}.${item.x}.${item.y}.${item.z}`;
            slideContent.innerHTML = `
                <strong>Location:</strong> ${loc}
                <br><strong>SKU:</strong> ${item.sku}
                <br><strong>Quantity:</strong> ${item.quantity}
                <br><input id="input-sku" type="text" placeholder="SKU" >
                <br><input id="input-quantity" type="number" placeholder="Кількість" >
                <br><button id="confirm-checking-btn">Позицію зібрано</button>
                <p id="checking-status"></p>
            `;

            const statusEl = document.getElementById('checking-status');

            document
                .getElementById('confirm-checking-btn')
                .addEventListener('click', async () => {
                    const sku = document.getElementById('input-sku').value;
                    const quantity = Number(
                        document.getElementById('input-quantity').value
                    );

                    if (!sku || !quantity) {
                        statusEl.textContent =
                            'Будь ласка, заповніть усі поля правильно.';
                        statusEl.style.color = 'red';
                        return;
                    }

                    try {
                        const res = await fetch(
                            `http://localhost:3000/check-item/order/${id}`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    sku,
                                    quantity,
                                }),
                            }
                        );

                        if (!res.ok) throw new Error(`Статус: ${res.status}`);

                        if (currentIndex < data.length - 1) {
                            currentIndex += 1;
                            renderSlide(currentIndex);
                        } else {
                            // ВСІ ПОЗИЦІЇ ЗІБРАНО — ЗМІНЮЄМО СТАТУС ЗАЯВКИ
                            try {
                                const updateRes = await fetch(
                                    `http://localhost:3000/orders/${id}/status`,
                                    {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            status: 'checked',
                                        }),
                                    }
                                );

                                if (!updateRes.ok)
                                    throw new Error(
                                        `Статус оновлення: ${updateRes.status}`
                                    );

                                slideContent.innerHTML = `<h2>Всі позиції перевірено! Заявку №${id} оновлено до статусу "checked".</h2>`;
                            } catch (updateErr) {
                                slideContent.innerHTML = `<h2>Позиції перевірено, але не вдалося оновити статус заявки: ${updateErr.message}</h2>`;
                            }
                        }
                    } catch (err) {
                        statusEl.textContent = `Помилка при надсиланні: ${err.message}`;
                        statusEl.style.color = 'red';
                    }
                });
        }

        renderSlide(currentIndex);
    } catch (error) {
        slideContent.innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}
