document.querySelector('.login__block').addEventListener('click', (e) => {
    if (e.target.closest('p')) {
        const targetEl = e.target.closest('p');
        if (!targetEl.classList.contain('active-login-block')) {
            targetEl.classList.add('active-login-block');
        }
    }
})