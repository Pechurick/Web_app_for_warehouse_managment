export function renderHomePage(user) {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h1>Головна сторінка</h1>
        <p>Вітаємо, ${user.name}!</p>
    `;
}
