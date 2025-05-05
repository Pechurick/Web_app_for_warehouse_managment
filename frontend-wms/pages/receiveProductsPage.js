export function renderReceiveProductsPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Прийом продуктів</h1>
        <button id="addReceivedItemBtn">Прийняти товар</button>
        <div id="output"></div>
    `;

    document
        .getElementById('addReceivedItemBtn')
        .addEventListener('click', () => {
            renderAddReceivedItemPage(); // нова сторінка з формою
        });

    fetchReceivedItems(); // функція, яка завантажує список
}

async function fetchReceivedItems() {
    const url = 'http://localhost:3000/received-items';
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const items = await response.json();

        const output = document.getElementById('output');
        output.innerHTML = '';

        if (items.length === 0) {
            output.innerHTML = '<p>Прийнятих продуктів немає.</p>';
            return;
        }

        items.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'received-item';
            div.style.cursor = 'pointer';

            div.innerHTML = `
                <img src="${item.image_url}" alt="${item.product_name}" style="width:100px; height:auto;">
                <div class="info">
                    <p><strong>Назва:</strong> ${item.product_name}</p>
                    <p><strong>SKU:</strong> ${item.sku}</p>
                    <p><strong>Кількість:</strong> ${item.quantity}</p>
                </div>
            `;

            // Обробник кліку
            div.addEventListener('click', () => {
                renderReceivedItemDetailsPage(item.sku);
            });

            output.appendChild(div);
        });
    } catch (error) {
        document.getElementById(
            'output'
        ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}

export async function renderReceivedItemDetailsPage(sku) {
    const root = document.getElementById('root');

    try {
        const response = await fetch(
            `http://localhost:3000/received-items/${sku}`
        );
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const item = await response.json();

        root.innerHTML = `
            <button id="backBtn">Назад</button>
            <h1>Деталі прийому</h1>
            <img src="${item.image_url}" alt="${item.product_name}" style="max-width:200px;">
            <p><strong>Назва:</strong> ${item.product_name}</p>
            <p><strong>SKU:</strong> ${item.sku}</p>
            <p><strong>Кількість:</strong> <span id="quantityValue">${item.quantity}</span></p>

            <form id="updateForm">
                <label>Оновити кількість:
                    <input type="number" name="quantity" min="1" value="${item.quantity}" required>
                </label>
                <button type="submit">Оновити</button>
            </form>
            <button id="deleteBtn" style="margin-left: 10px; color: red;">Видалити</button>

            <div id="message" style="margin-top: 10px;"></div>
        `;

        // Назад
        document.getElementById('backBtn').addEventListener('click', () => {
            renderReceiveProductsPage();
        });

        // Видалити
        document
            .getElementById('deleteBtn')
            .addEventListener('click', async () => {
                const confirmDelete = confirm(
                    'Ви впевнені, що хочете видалити цей запис?'
                );
                if (!confirmDelete) return;

                try {
                    const deleteResponse = await fetch(
                        `http://localhost:3000/received-items/${sku}`,
                        {
                            method: 'DELETE',
                        }
                    );
                    if (!deleteResponse.ok)
                        throw new Error(
                            `HTTP error! Status: ${deleteResponse.status}`
                        );

                    document.getElementById(
                        'message'
                    ).innerHTML = `<p style="color:green;">Успішно видалено.</p>`;
                    setTimeout(() => renderReceiveProductsPage(), 1000);
                } catch (error) {
                    document.getElementById(
                        'message'
                    ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
                }
            });

        // Оновлення кількості
        document
            .getElementById('updateForm')
            .addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const quantity = parseInt(formData.get('quantity'), 10);
                if (
                    confirm(
                        `Ви впевнені, що хочете оновити кількість товару із ${sku}?`
                    )
                ) {
                    try {
                        const updateResponse = await fetch(
                            `http://localhost:3000/received-items/${sku}`,
                            {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ quantity }),
                            }
                        );

                        if (!updateResponse.ok)
                            throw new Error(
                                `HTTP error! Status: ${updateResponse.status}`
                            );

                        document.getElementById(
                            'message'
                        ).innerHTML = `<p style="color:green;">Кількість оновлено.</p>`;
                        document.getElementById('quantityValue').innerText =
                            quantity;
                    } catch (error) {
                        document.getElementById(
                            'message'
                        ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
                    }
                }
            });
    } catch (error) {
        root.innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}

export function renderAddReceivedItemPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Додати прийом товару</h1>
        <form id="addReceivedItemForm">
            <label>
                SKU:
                <input type="text" name="sku" required>
            </label><br><br>
            <label>
                Кількість:
                <input type="number" name="quantity" required min="1">
            </label><br><br>
            <button type="submit">Додати</button>
            <button type="button" id="cancelBtn">Скасувати</button>
        </form>
        <div id="message"></div>
    `;

    document.getElementById('cancelBtn').addEventListener('click', () => {
        renderReceiveProductsPage(); // повернення назад
    });

    document
        .getElementById('addReceivedItemForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const sku = form.sku.value.trim();
            const quantity = parseInt(form.quantity.value.trim(), 10);

            try {
                const response = await fetch(
                    'http://localhost:3000/received-items',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sku, quantity }),
                    }
                );

                if (!response.ok)
                    throw new Error(`HTTP error! Status: ${response.status}`);

                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:green;">Успішно додано!</p>`;
                setTimeout(() => renderReceiveProductsPage(), 1000); // повернення назад після паузи
            } catch (error) {
                document.getElementById(
                    'message'
                ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
            }
        });
}
