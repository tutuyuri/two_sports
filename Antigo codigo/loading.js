(() => {
    'use strict';

    const overlay = document.createElement('div');
    overlay.className = 'carregamento';
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="carregamento__caixa"><span class="carregamento__spinner" aria-hidden="true"></span><strong>Carregando...</strong></div>';
    document.body.append(overlay);

    const showLoading = () => {
        overlay.classList.add('ativo');
        overlay.setAttribute('aria-hidden', 'false');
    };

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
        showLoading();
    });

    window.addEventListener('pageshow', () => {
        overlay.classList.remove('ativo');
        overlay.setAttribute('aria-hidden', 'true');
    });
})();