import { showNavbar } from './navbar.js';
import { fetchAndDisplayProducts } from './products.js';

export function loginClient() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    if (!email || !password) {
        errorMessage.textContent = 'Будь ласка, введіть email та пароль!';
        return;
    }

    fetch('http://localhost:3000/login-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.client) {
                saveClientData(data.client);
                showNavbar(data.client);
                fetchAndDisplayProducts();
            } else {
                errorMessage.textContent = 'Невірний email або пароль!';
            }
        })
        .catch((error) => {
            console.error('Помилка:', error);
            errorMessage.textContent = 'Сталася помилка при запиті до сервера.';
        });
}

export function saveClientData(client) {
    const clientString = JSON.stringify(client);
    const encrypted = btoa(clientString);
    localStorage.setItem('client', encrypted);
}

export function registerClient() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;

    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    if (!name || !email || !phone || !password) {
        errorMessage.textContent = 'Будь ласка, заповніть всі поля реєстрації.';
        return;
    }

    fetch('http://localhost:3000/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            email,
            phone: Number(phone),
            password,
        }),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error('Помилка під час реєстрації');
            }
            return res.json();
        })
        .then((data) => {
            alert(
                'Реєстрацію успішно завершено. Увійдіть за допомогою ваших даних.'
            );
            showLoginForm();
        })
        .catch((err) => {
            errorMessage.textContent =
                'Не вдалося зареєструватися. Спробуйте ще раз.';
            console.error(err);
        });
}

export function showLoginForm() {
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = ''; // очищаємо навігацію
    const root = document.getElementById('root');
    root.innerHTML = `
        <h2>Вхід</h2>
        <input type="text" id="email" placeholder="Email" value="ivanov@mail.com"><br><br>
        <input type="password" id="password" placeholder="Пароль" value="1234"><br><br>
        <button id="login-button" class="button">Увійти</button>

        <hr><br>
        <h2>Реєстрація</h2>
        <input type="text" id="reg-name" placeholder="Ім'я"><br><br>
        <input type="text" id="reg-email" placeholder="Email"><br><br>
        <input type="text" id="reg-phone" placeholder="Телефон"><br><br>
        <input type="password" id="reg-password" placeholder="Пароль"><br><br>
        <button id="register-button" class="button">Зареєструватися</button>

        <p id="error-message" style="color: red;"></p>
    `;

    document
        .getElementById('login-button')
        .addEventListener('click', loginClient);

    document
        .getElementById('register-button')
        .addEventListener('click', registerClient);
}
