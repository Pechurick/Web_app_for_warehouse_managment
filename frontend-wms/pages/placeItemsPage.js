export function renderPlaceItemsPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Керування місцями</h1>
        <button id="placeItemBtn">Розмістити товар</button>
        <button id="changePlacedItemBtn">Змінити координати розміщення товару</button>
        <div id="output"></div>
    `;

    document.getElementById('placeItemBtn').addEventListener('click', () => {
        renderCreatePlacedItemPage();
    });

    document
        .getElementById('changePlacedItemBtn')
        .addEventListener('click', () => {
            renderMovePlacedItemPage();
        });

    fetchPlacedItems();
}

async function fetchPlacedItems() {
    const url = 'http://localhost:3000/placed-items';
    const output = document.getElementById('output');

    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const items = await response.json();

        if (items.length === 0) {
            output.innerHTML = '<p>Жодного товару не розміщено.</p>';
            return;
        }

        output.innerHTML = items
            .map(
                (item) => `
            <div 
                class="placed-item" 
                data-id="${item.id}" 
                style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; cursor: pointer;"
            >
                <h3>${item.product_name}</h3>
                <p><strong>SKU:</strong> ${item.sku}</p>
                <p><strong>Кількість:</strong> ${item.quantity}</p>
                <p><strong>Координати:</strong> ${item.zone}.${item.x}.${item.y}.${item.z}</p>
                <img src="${item.image_url}" alt="${item.product_name}" style="width: 100px; height: auto;">
            </div>
        `
            )
            .join('');

        // додаємо обробники кліків
        document.querySelectorAll('.placed-item').forEach((item) => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                renderPlacedItemDetailsPage(id);
            });
        });
    } catch (error) {
        output.innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}

export function renderPlacedItemDetailsPage(itemId) {
    fetch(`http://localhost:3000/placed-items/${itemId}`)
        .then((res) => res.json())
        .then((item) => {
            const root = document.getElementById('root');
            root.innerHTML = `
                <h1>Інформація про товар</h1>
                <img src="${item.image_url}" alt="${item.product_name}" style="max-width: 200px;"><br>
                <strong>${item.product_name}</strong><br>
                SKU: ${item.sku}<br>
                Кількість: ${item.quantity}<br>
                Координати: ${item.zone}.${item.x}.${item.y}.${item.z}<br><br>

                <h3>Видалити частину товару</h3>
                <form id="deleteItemForm">
                    <label>Кількість для видалення: <input type="number" name="quantity" min="1" required></label><br><br>
                    <button type="submit">Видалити</button>
                    <button type="button" id="backBtn">Назад</button>
                </form>
                <div id="deleteMessage"></div>
            `;

            document.getElementById('backBtn').addEventListener('click', () => {
                renderPlaceItemsPage();
            });

            document
                .getElementById('deleteItemForm')
                .addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const quantity = parseInt(e.target.quantity.value, 10);

                    const body = {
                        sku: item.sku,
                        zone: item.zone,
                        x: item.x,
                        y: item.y,
                        z: item.z,
                        quantity,
                    };

                    const confirmed = confirm(
                        'Ви дійсно хочете видалити цей товар?'
                    );
                    if (!confirmed) return;

                    try {
                        const response = await fetch(
                            'http://localhost:3000/placed-items/remove',
                            {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                            }
                        );

                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);

                        document.getElementById(
                            'deleteMessage'
                        ).innerHTML = `<p style="color:green;">Успішно видалено ${quantity} шт.</p>`;
                        e.target.reset();
                    } catch (err) {
                        document.getElementById(
                            'deleteMessage'
                        ).innerHTML = `<p style="color:red;">Помилка: ${err.message}</p>`;
                    }
                });
        })
        .catch((err) => {
            document.getElementById(
                'root'
            ).innerHTML = `<p style="color:red;">Помилка завантаження товару: ${err.message}</p>`;
        });
}

export function renderCreatePlacedItemPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Розмістити товар</h1>
        <form id="placeItemForm">
            <label>SKU: <input type="text" name="sku" required></label><br><br>
            <label>Координати (zone.x.y.z): <input type="text" name="coordinates" required></label><br><br>
            <label>Кількість: <input type="number" name="quantity" min="1" required></label><br><br>
            <button type="submit">Розмістити</button>
            <button type="button" id="backButton">Назад</button>
        </form>
        <div id="message"></div>
    `;

    // Назад
    document.getElementById('backButton').addEventListener('click', () => {
        renderPlaceItemsPage();
    });

    // Відправка форми
    document
        .getElementById('placeItemForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = e.target;
            const sku = form.sku.value.trim();
            const quantity = parseInt(form.quantity.value, 10);
            const coordinates = form.coordinates.value.trim();

            const match = coordinates.match(/^([A-Z])\.(\d+)\.(\d+)\.(\d+)$/i);
            if (!match) {
                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:red;">Неправильний формат координат. Використай, наприклад, E.5.9.1</p>`;
                return;
            }

            const [, zone, x, y, z] = match;

            try {
                const response = await fetch(
                    'http://localhost:3000/placed-items',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sku,
                            zone,
                            x: +x,
                            y: +y,
                            z: +z,
                            quantity,
                        }),
                    }
                );

                if (!response.ok)
                    throw new Error(`Помилка HTTP ${response.status}`);

                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:green;">Товар розміщено успішно!</p>`;
                form.reset();
            } catch (error) {
                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
            }
        });
}

export function renderMovePlacedItemPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Змінити розміщення товару</h1>
        <form id="moveItemForm">
            <label>SKU: <input type="text" name="sku" required></label><br><br>
            <label>Звідки (zone.x.y.z): <input type="text" name="from" required></label><br><br>
            <label>Куди (zone.x.y.z): <input type="text" name="to" required></label><br><br>
            <label>Кількість: <input type="number" name="quantity" min="1" required></label><br><br>
            <button type="submit">Перемістити</button>
            <button type="button" id="backButton">Назад</button>
        </form>
        <div id="message"></div>
    `;

    document.getElementById('backButton').addEventListener('click', () => {
        renderPlaceItemsPage();
    });

    document
        .getElementById('moveItemForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = e.target;
            const sku = form.sku.value.trim();
            const quantity = parseInt(form.quantity.value, 10);

            const fromMatch = form.from.value
                .trim()
                .match(/^([A-Z])\.(\d+)\.(\d+)\.(\d+)$/i);
            const toMatch = form.to.value
                .trim()
                .match(/^([A-Z])\.(\d+)\.(\d+)\.(\d+)$/i);

            if (!fromMatch || !toMatch) {
                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:red;">Неправильний формат координат. Використай приклад: E.5.9.1</p>`;
                return;
            }

            const [, fromZone, fromX, fromY, fromZ] = fromMatch;
            const [, toZone, toX, toY, toZ] = toMatch;

            const body = {
                sku,
                from: { zone: fromZone, x: +fromX, y: +fromY, z: +fromZ },
                to: { zone: toZone, x: +toX, y: +toY, z: +toZ },
                quantity,
            };

            try {
                const response = await fetch(
                    'http://localhost:3000/placed-items/move',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    }
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:green;">Товар переміщено успішно!</p>`;
                form.reset();
            } catch (error) {
                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
            }
        });
}
