import { renderHomePage } from './pages/homePage.js';
import { renderProfilePage } from './pages/profilePage.js';
import { renderLoginView } from './login.js';

import { renderProductsPage } from './pages/productsPage.js';
import { renderReceiveProductsPage } from './pages/receiveProductsPage.js';
import { renderStorageLocationsPage } from './pages/storageLocations.js';
import { renderPlaceItemsPage } from './pages/placeItemsPage.js';
import { renderPickItemsPage } from './pages/pickItemsPage.js';
import { renderCheckItemsPage } from './pages/checkItemsPage.js';
import { renderShipItemsPage } from './pages/shipItemsPage.js';
import { renderShowShippedItemsPage } from './pages/showShippedItemsPage.js';

export function renderNavbar(user) {
    const navbar = document.getElementById('navbar-container');
    navbar.classList.add('navbar');
    navbar.innerHTML = `
        <div>
            <strong><a href="#" id="home-link">Мій застосунок</a></strong>
            <a href="#" id="products-link" style="margin-left: 20px;">Керування продуктами</a>
            <a href="#" id="receive-products-link" style="margin-left: 20px;">Прийом продуктів</a>
            <a href="#" id="storage-locations-link" style="margin-left: 20px;">Керування місцями</a>
            <a href="#" id="place-items-link" style="margin-left: 20px;">Розміщення товарів</a>
            <a href="#" id="pick-items-link" style="margin-left: 20px;">Відбір товарів</a>
            <a href="#" id="check-items-link" style="margin-left: 20px;">Контроль відбраних товарів</a>
            <a href="#" id="ship-items-link" style="margin-left: 20px;">Відправлення товарів</a>
            <a href="#" id="show-ship-items-link" style="margin-left: 20px;">Перегляд надісланих товарів</a>
        </div>
        <div id="profile-menu">
            <button id="profile-button">Профіль ⯆</button>
            <div id="profile-dropdown">
                <p><strong>Ім’я:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Роль:</strong> ${user.role}</p>
                <a href="#" id="profile-page-link">Профіль</a><br />
                <button id="logout-button">Вийти</button>
            </div>
        </div>
    `;

    document.getElementById('home-link').addEventListener('click', (e) => {
        e.preventDefault();
        renderHomePage(user);
    });

    document
        .getElementById('profile-page-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderProfilePage(user);
        });

    document.getElementById('profile-button').addEventListener('click', () => {
        const dropdown = document.getElementById('profile-dropdown');
        dropdown.classList.toggle('visible');
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        renderLoginView();
    });

    document.getElementById('products-link').addEventListener('click', (e) => {
        e.preventDefault();
        renderProductsPage();
    });

    document
        .getElementById('receive-products-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderReceiveProductsPage();
        });

    document
        .getElementById('storage-locations-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderStorageLocationsPage();
        });

    document
        .getElementById('place-items-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderPlaceItemsPage();
        });

    document
        .getElementById('pick-items-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderPickItemsPage();
        });

    document
        .getElementById('check-items-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderCheckItemsPage();
        });

    document
        .getElementById('ship-items-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderShipItemsPage();
        });

    document
        .getElementById('show-ship-items-link')
        .addEventListener('click', (e) => {
            e.preventDefault();
            renderShowShippedItemsPage();
        });
}
