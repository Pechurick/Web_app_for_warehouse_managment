export function renderProductsPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Керування продуктами</h1>
        <button id="createProductButton">➕ Додати продукт</button>
        <div id="output"></div>
    `;
    document
        .getElementById('createProductButton')
        .addEventListener('click', () => {
            renderCreateProductPage();
        });
    fetchProducts();
}

async function fetchProducts() {
    const url = 'http://localhost:3000/products';
    const output = document.getElementById('output');
    output.innerHTML = `<p>Завантаження продуктів...</p>`;

    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const products = await response.json();

        output.innerHTML = ''; // Очистка
        products.forEach((product) => {
            const div = document.createElement('div');
            div.className = 'product';
            div.style.cursor = 'pointer';
            div.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" width="100">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>SKU:</strong> ${product.sku}</p>
                </div>
            `;
            div.addEventListener('click', () => {
                renderProductDetailsPage(product.id);
            });
            output.appendChild(div);
        });
    } catch (error) {
        output.innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}

export async function renderCreateProductPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <button id="backButton">⬅ Назад</button>
        <h2>Додати новий продукт</h2>
        <form id="createProductForm">
            <label>Назва: <input type="text" name="name" required></label><br>
            <label>SKU: <input type="text" name="sku" required></label><br>
            <label>Опис: <textarea name="description" required></textarea></label><br>
            <label>Категорія: <input type="text" name="category" required></label><br>
            <label>Штрихкод: <input type="text" name="barcode" required></label><br>
            <label>URL зображення: <input type="url" name="image_url" required></label><br>
            <button type="submit">Створити</button>
        </form>
    `;

    document.getElementById('backButton').addEventListener('click', () => {
        renderProductsPage();
    });

    document
        .getElementById('createProductForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const product = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                alert('Продукт успішно створено!');
                renderProductsPage();
            } catch (error) {
                alert('Помилка при створенні продукту: ' + error.message);
            }
        });
}

export async function renderProductDetailsPage(id) {
    const root = document.getElementById('root');

    try {
        const response = await fetch(`http://localhost:3000/products/${id}`);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const product = await response.json();

        const renderFieldEditor = (label, key, value) => `
            <label><strong>${label}:</strong></label><br/>
            <input type="text" id="${key}Input" value="${value}" />
            <button data-key="${key}" class="update-btn">Оновити</button>
            <br/><br/>
        `;

        root.innerHTML = `
            <button id="backButton">⬅ Назад</button>
            <h2>Редагування продукту</h2>
            <img src="${product.image_url}" alt="${
            product.name
        }" style="max-width:200px;"><br/><br/>

            ${renderFieldEditor('Назва', 'name', product.name)}
            ${renderFieldEditor('SKU', 'sku', product.sku)}
            ${renderFieldEditor('Категорія', 'category', product.category)}
            ${renderFieldEditor('Опис', 'description', product.description)}
            ${renderFieldEditor('Штрихкод', 'barcode', product.barcode)}
            ${renderFieldEditor(
                'Зображення (URL)',
                'image_url',
                product.image_url
            )}
            
            <button id="deleteButton" style="color:white;background-color:red;">🗑️ Видалити</button>
        `;

        // Назад
        document.getElementById('backButton').addEventListener('click', () => {
            renderProductsPage();
        });

        // Видалення
        document
            .getElementById('deleteButton')
            .addEventListener('click', async () => {
                if (
                    confirm(
                        `Ви впевнені, що хочете видалити "${product.name}"?`
                    )
                ) {
                    try {
                        const delRes = await fetch(
                            `http://localhost:3000/products/${id}`,
                            {
                                method: 'DELETE',
                            }
                        );
                        if (!delRes.ok)
                            throw new Error(
                                `HTTP error! Status: ${delRes.status}`
                            );
                        alert('Продукт видалено.');
                        renderProductsPage();
                    } catch (error) {
                        alert('Помилка при видаленні: ' + error.message);
                    }
                }
            });

        // Оновлення окремих полів
        document.querySelectorAll('.update-btn').forEach((button) => {
            button.addEventListener('click', async () => {
                const key = button.getAttribute('data-key');
                const newValue = document.getElementById(`${key}Input`).value;

                if (confirm(`Ви впевнені, що хочете оновити поле ${key}?`)) {
                    try {
                        const updateRes = await fetch(
                            `http://localhost:3000/products/${id}`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ [key]: newValue }),
                            }
                        );

                        if (!updateRes.ok)
                            throw new Error(
                                `HTTP error! Status: ${updateRes.status}`
                            );

                        alert(`Поле "${key}" оновлено.`);
                        renderProductDetailsPage(id); // перезавантаження з оновленими даними
                    } catch (error) {
                        alert(
                            `Помилка при оновленні поля "${key}": ${error.message}`
                        );
                    }
                }
            });
        });
    } catch (error) {
        root.innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}
