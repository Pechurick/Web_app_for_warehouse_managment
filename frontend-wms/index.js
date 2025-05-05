import { getProfile, renderLoginView } from './login.js';
import { renderNavbar } from './navbar.js';
import { renderHomePage } from './pages/homePage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const user = await getProfile(token);
            renderNavbar(user);
            renderHomePage(user);
        } catch {
            localStorage.removeItem('token');
            renderLoginView();
        }
    } else {
        renderLoginView();
    }
});
