import { renderHomePage } from './pages/homePage.js';
import { renderNavbar } from './navbar.js';

export async function login(email, password) {
    const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Невірний email або пароль');
    return res.json(); // { token }
}

export async function getProfile(token) {
    const res = await fetch('http://localhost:3000/auth/protected', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Недійсний токен');
    const data = await res.json();
    return data.user;
}

export function renderLoginView() {
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = '';
    navbarContainer.classList.remove('navbar');

    const root = document.getElementById('root');
    root.innerHTML = `
        <h2>Увійти</h2>
        <input type="email" id="email" placeholder="Email" value="ivan@example.com"/><br />
        <input type="password" id="password" placeholder="Пароль" value="1234"/><br />
        <button id="login-button">Увійти</button>
        <p id="error" style="color: red;"></p>
    `;

    document
        .getElementById('login-button')
        .addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('error');

            try {
                const { token } = await login(email, password);
                localStorage.setItem('token', token);

                const user = await getProfile(token);
                renderNavbar(user);
                renderHomePage(user);
            } catch (err) {
                errorEl.textContent = err.message;
            }
        });
}
