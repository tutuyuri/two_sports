(() => {
    'use strict';

    const USER_KEY = 'twoSports.user.v1';
    const formMessage = document.querySelector('[data-form-message]');
    const setMessage = (message, isError = false) => {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.classList.toggle('erro', isError);
    };

    document.querySelectorAll('[data-toggle-password]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.togglePassword);
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            button.textContent = showing ? 'Mostrar' : 'Ocultar';
            button.setAttribute('aria-label', `${showing ? 'Mostrar' : 'Ocultar'} senha`);
        });
    });

    const cadastroForm = document.querySelector('#cadastro-form');
    cadastroForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(cadastroForm);
        const nome = String(data.get('nome')).trim();
        const email = String(data.get('email')).trim().toLowerCase();
        const senha = String(data.get('senha'));
        const confirmarSenha = String(data.get('confirmarSenha'));

        if (nome.length < 3) return setMessage('Informe seu nome completo.', true);
        if (!email.includes('@') || !email.includes('.')) return setMessage('Informe um e-mail válido.', true);
        if (senha.length < 6) return setMessage('A senha deve ter pelo menos 6 caracteres.', true);
        if (senha !== confirmarSenha) return setMessage('As senhas não coincidem.', true);

        localStorage.setItem(USER_KEY, JSON.stringify({ nome, email, senha }));
        setMessage('Cadastro realizado! Redirecionando para o login.');
        cadastroForm.reset();
        window.setTimeout(() => window.location.assign('login.html'), 900);
    });

    const loginForm = document.querySelector('#login-form');
    loginForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(loginForm);
        const email = String(data.get('email')).trim().toLowerCase();
        const senha = String(data.get('senha'));
        let user = null;
        try { user = JSON.parse(localStorage.getItem(USER_KEY)); } catch { /* cadastro inválido */ }

        if (!email || !senha) return setMessage('Preencha e-mail e senha.', true);
        if (!user || user.email !== email || user.senha !== senha) return setMessage('E-mail ou senha incorretos.', true);
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';
        setMessage(`Olá, ${user.nome.split(' ')[0]}! Carregando sua conta.`);
        const loading = document.querySelector('.carregamento');
        loading?.classList.add('ativo');
        loading?.setAttribute('aria-hidden', 'false');
        window.setTimeout(() => window.location.assign('TWO SPORTS.HTML'), 700);
    });
})();