document.addEventListener('DOMContentLoaded', () => {
    // Lógica para o modo claro/escuro
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme');

        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                themeToggle.textContent = '☀️';
            } else {
                themeToggle.textContent = '🌙';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // Lógica para o Rádio Player
    const radioContainer = document.getElementById('radio-player-container');
    const toggleRadioBtn = document.getElementById('toggle-radio');
    const closeRadioBtn = document.getElementById('close-radio');

    if (toggleRadioBtn && radioContainer) {
        toggleRadioBtn.addEventListener('click', () => {
            radioContainer.classList.toggle('hidden');
        });
    }

    if (closeRadioBtn && radioContainer) {
        closeRadioBtn.addEventListener('click', () => {
            radioContainer.classList.add('hidden');
        });
    }
});
