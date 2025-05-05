export function renderStorageLocationsPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Керування місцями</h1>
        <button id="addNewStorage">Додати нове місце</button>
        <div id="output"></div>
    `;

    document.getElementById('addNewStorage').addEventListener('click', () => {
        renderCreateStorageLocationPage();
    });

    fetchAllStorageLocations();
}

async function fetchAllStorageLocations() {
    const url = 'http://localhost:3000/storage-locations';
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const locations = await response.json();

        const output = document.getElementById('output');
        output.innerHTML = '';

        if (locations.length === 0) {
            output.innerHTML = `<p>Немає жодного місця зберігання.</p>`;
            return;
        }

        locations.forEach((loc) => {
            const div = document.createElement('div');
            div.className = 'location';
            div.style.cursor = 'pointer';
            div.innerHTML = `
                
                <p><strong>Зона:</strong> ${loc.zone}</p>
                <p><strong>X:</strong> ${loc.x}</p>
                <p><strong>Y:</strong> ${loc.y}</p>
                <p><strong>Z:</strong> ${loc.z}</p>
                <hr>
            `;

            div.addEventListener('click', () => {
                renderStorageLocationDetailsPage(loc.id);
            });

            output.appendChild(div);
        });
    } catch (error) {
        document.getElementById(
            'output'
        ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}

export function renderStorageLocationDetailsPage(id) {
    const root = document.getElementById('root');
    root.innerHTML = `
        <button id="backButton">Назад</button>
        <h1>Деталі місця зберігання</h1>
        <div id="output"></div> 
        <button id="deleteButton">Видалити</button>
    `;

    document.getElementById('backButton').addEventListener('click', () => {
        renderStorageLocationsPage();
    });

    document
        .getElementById('deleteButton')
        .addEventListener('click', async () => {
            await deleteStorageLocation(id);
        });

    fetchOneStorageLocation(id);
}

async function fetchOneStorageLocation(id) {
    const url = `http://localhost:3000/storage-locations/${id}`;
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const location = await response.json();

        const output = document.getElementById('output');
        output.innerHTML = `
            <label>Зона: <input type="text" id="zoneInput" value="${location.zone}" /></label><br/>
            <label>X: <input type="number" id="xInput" value="${location.x}" /></label><br/>
            <label>Y: <input type="number" id="yInput" value="${location.y}" /></label><br/>
            <label>Z: <input type="number" id="zInput" value="${location.z}" /></label><br/>
            <button id="updateButton">Оновити</button>
            <div id="updateStatus"></div>
        `;

        document
            .getElementById('updateButton')
            .addEventListener('click', async () => {
                const updatedData = {
                    zone: document.getElementById('zoneInput').value,
                    x: parseInt(document.getElementById('xInput').value, 10),
                    y: parseInt(document.getElementById('yInput').value, 10),
                    z: parseInt(document.getElementById('zInput').value, 10),
                };

                if (confirm(`Ви впевнені, що хочете оновити координати?`)) {
                    try {
                        const updateResponse = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updatedData),
                        });

                        if (!updateResponse.ok)
                            throw new Error(
                                `HTTP error! Status: ${updateResponse.status}`
                            );

                        document.getElementById('updateStatus').innerHTML =
                            '<p style="color:green;">Оновлено успішно!</p>';
                    } catch (error) {
                        document.getElementById(
                            'updateStatus'
                        ).innerHTML = `<p style="color:red;">Помилка при оновленні: ${error.message}</p>`;
                    }
                }
            });
    } catch (error) {
        document.getElementById(
            'output'
        ).innerHTML = `<p style="color:red;">Помилка: ${error.message}</p>`;
    }
}

async function deleteStorageLocation(id) {
    const confirmed = confirm('Ви дійсно хочете видалити це місце зберігання?');
    if (confirmed) {
        try {
            const response = await fetch(
                `http://localhost:3000/storage-locations/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) throw new Error('Не вдалося видалити місце');

            alert('Місце зберігання успішно видалено');
            renderStorageLocationsPage(); // оновити сторінку після видалення
        } catch (error) {
            alert(`Помилка при видаленні: ${error.message}`);
        }
    }
}

export function renderCreateStorageLocationPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Створення нового місця зберігання</h1>
        <form id="createForm">
            <label for="zone">Зона:</label>
            <input type="text" id="zone" name="zone" required /><br /><br />

            <label for="x">X:</label>
            <input type="number" id="x" name="x" required /><br /><br />

            <label for="y">Y:</label>
            <input type="number" id="y" name="y" required /><br /><br />

            <label for="z">Z:</label>
            <input type="number" id="z" name="z" required /><br /><br />

            <button type="submit">Створити</button>
        </form>
        <button id="backButton">Назад</button>
    `;

    // Кнопка для повернення на сторінку керування місцями
    document.getElementById('backButton').addEventListener('click', () => {
        renderStorageLocationsPage(); // або перенаправлення на іншу сторінку
    });

    // Обробка події на форму для відправки запиту на сервер
    document
        .getElementById('createForm')
        .addEventListener('submit', async (event) => {
            event.preventDefault(); // Запобігаємо стандартній поведінці форми

            const zone = document.getElementById('zone').value;
            const x = parseInt(document.getElementById('x').value);
            const y = parseInt(document.getElementById('y').value);
            const z = parseInt(document.getElementById('z').value);

            try {
                const response = await fetch(
                    'http://localhost:3000/storage-locations',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ zone, x, y, z }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Після успішного створення відображаємо повідомлення або перенаправляємо на іншу сторінку
                alert('Місце зберігання успішно створено!');
                renderStorageLocationsPage(); // або перенаправлення на сторінку з місцями
            } catch (error) {
                alert(`Помилка при створенні місця: ${error.message}`);
            }
        });
}
