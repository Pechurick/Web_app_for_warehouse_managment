import { loadClientData, showNavbar } from './navbar.js';
import { fetchAndDisplayProducts } from './products.js';
import { showLoginForm } from './login.js';

window.onload = function () {
    const client = loadClientData();
    if (client) {
        showNavbar(client);
        fetchAndDisplayProducts();
    } else {
        showLoginForm();
    }
};
