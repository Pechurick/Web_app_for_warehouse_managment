import { showLoginForm } from './login.js';
import { showCart } from './cart.js';
import { fetchAndDisplayProducts } from './products.js';

export function logoutClient() {
    localStorage.removeItem('client');
    localStorage.removeItem('cart');
    showLoginForm();
}

export function loadClientData() {
    const encrypted = localStorage.getItem('client');
    if (encrypted) {
        try {
            const decrypted = atob(encrypted);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Помилка розшифрування:', error);
            return null;
        }
    }
    return null;
}

export function showNavbar(client) {
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = `
        <div id="navbar">
            <div id="logo">Мій Застосунок</div>
            <div id="nav-links">
                <button id="home-button">Головна</button>
                <button id="cart-button">Корзина</button>
            </div>
            <div id="profile-menu">
                <button id="profile-button">Профіль ⮟</button>
                <div id="profile-dropdown" class="hidden">
                    <p><strong>Ім'я:</strong> ${client.name}</p>
                    <p><strong>Email:</strong> ${client.email}</p>
                    <p><strong>Телефон:</strong> ${client.phone}</p>
                    <button id="logout-button" class="button">Вийти</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('profile-button').addEventListener('click', () => {
        const dropdown = document.getElementById('profile-dropdown');
        dropdown.classList.toggle('hidden');
    });

    document
        .getElementById('logout-button')
        .addEventListener('click', logoutClient);

    document.getElementById('cart-button').addEventListener('click', showCart);

    // 👉 КНОПКА "ГОЛОВНА"
    document
        .getElementById('home-button')
        .addEventListener('click', fetchAndDisplayProducts);
}
