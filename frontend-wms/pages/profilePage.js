export function renderProfilePage(user) {
    const root = document.getElementById('root');
    root.innerHTML = `
        <h2>Профіль користувача</h2>
        <p><strong>Ім’я:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Роль:</strong> ${user.role}</p>
    `;
}
