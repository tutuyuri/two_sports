(() => {
    'use strict';

    const STORAGE_KEY = 'twoSports.cart.v1';
    const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const getCart = () => {
        try {
            const cart = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(cart) ? cart : [];
        } catch { return []; }
    };
    const saveCart = (cart) => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    const checkoutEndpoint = (() => {
        const localPage = location.protocol === 'file:' ||
            (['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '3000');
        return localPage ? 'http://localhost:3000/api/checkout' : '/api/checkout';
    })();
    const countItems = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);
    const updateBadge = () => document.querySelectorAll('[data-cart-count]').forEach((el) => el.textContent = countItems(getCart()));
    const showNotice = (message, isError = false) => {
        const notice = document.querySelector('[data-cart-notice]');
        if (!notice) return;
        notice.textContent = message;
        notice.classList.toggle('erro', isError);
        notice.classList.add('ativa');
        window.clearTimeout(showNotice.timer);
        showNotice.timer = window.setTimeout(() => notice.classList.remove('ativa'), 3200);
    };
    const itemKey = (id, variations) => `${id}:${Object.entries(variations).sort().map(([key, value]) => `${key}=${value}`).join('|')}`;

    const addFromCard = (card) => {
        const variations = {};
        for (const select of card.querySelectorAll('[data-variation]')) {
            if (!select.value) {
                showNotice(`Selecione ${select.dataset.variation.toLowerCase()} antes de adicionar.`, true);
                select.focus();
                return;
            }
            variations[select.dataset.variation] = select.value;
        }
        const product = card.dataset;
        const stock = Number(product.productStock);
        if (!stock) return showNotice('Este produto está esgotado.', true);
        const key = itemKey(product.productId, variations);
        const cart = getCart();
        const existing = cart.find((item) => item.key === key);
        if (existing) {
            if (existing.quantity >= stock) return showNotice(`Limite de ${stock} unidade(s) disponível(is) atingido.`, true);
            existing.quantity += 1;
        } else {
            cart.push({ key, id: product.productId, name: product.productName, price: Number(product.productPrice), stock, image: product.productImage, variations, quantity: 1 });
        }
        saveCart(cart);
        updateBadge();
        showNotice(`${product.productName} foi adicionado ao carrinho.`);
    };

    const line = (label, value, emphasis = false) => `<div class="resumo__linha${emphasis ? ' resumo__linha--total' : ''}"><span>${label}</span><strong>${value}</strong></div>`;
    const renderCart = () => {
        const root = document.querySelector('[data-cart-page]');
        if (!root) return;
        const cart = getCart();
        if (!cart.length) {
            root.innerHTML = `<section class="carrinho-vazio"><h1>Seu carrinho está vazio</h1><p>Explore nossos produtos e encontre o equipamento ideal para o seu esporte.</p><a class="btn" href="produtos.html">Ver produtos</a></section>`;
            return;
        }
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = subtotal >= 250 ? 0 : 19.90;
        root.innerHTML = `<div class="carrinho-layout"><section><div class="carrinho-titulo"><div><span class="etiqueta">Sacola</span><h1>Meu carrinho</h1></div><button class="link-perigo" type="button" data-clear-cart>Limpar carrinho</button></div><div class="itens-carrinho">${cart.map((item) => `<article class="item-carrinho" data-key="${item.key}"><img src="${item.image}" alt="${item.name}"><div class="item-carrinho__info"><h2>${item.name}</h2>${Object.entries(item.variations).map(([name, value]) => `<p>${name}: <strong>${value}</strong></p>`).join('')}<p class="item-carrinho__preco">${money.format(item.price)} cada</p><button type="button" class="link-perigo" data-remove-item>Remover</button></div><div class="quantidade" aria-label="Quantidade de ${item.name}"><button type="button" data-decrease aria-label="Diminuir quantidade">−</button><span>${item.quantity}</span><button type="button" data-increase aria-label="Aumentar quantidade">+</button></div><strong class="item-carrinho__subtotal">${money.format(item.price * item.quantity)}</strong></article>`).join('')}</div><a class="continuar" href="produtos.html">← Continuar comprando</a></section><aside class="resumo"><h2>Resumo do pedido</h2>${line('Subtotal', money.format(subtotal))}${line('Desconto', money.format(0))}${line('Frete', shipping ? money.format(shipping) : 'Grátis')}${line('Total', money.format(subtotal + shipping), true)}<p class="resumo__aviso">O valor e o estoque serão confirmados no checkout.</p><button class="btn btn-checkout" type="button" data-checkout>Finalizar compra</button></aside></div>`;
    };
    const changeQuantity = (key, delta) => {
        const cart = getCart();
        const item = cart.find((candidate) => candidate.key === key);
        if (!item) return;
        if (delta > 0 && item.quantity >= item.stock) return showNotice(`Há apenas ${item.stock} unidade(s) disponível(is).`, true);
        item.quantity += delta;
        saveCart(cart.filter((candidate) => candidate.quantity > 0));
        updateBadge(); renderCart();
    };

    document.addEventListener('click', (event) => {
        const addButton = event.target.closest('[data-add-to-cart]');
        if (addButton) return addFromCard(addButton.closest('[data-product-id]'));
        const item = event.target.closest('[data-key]');
        if (event.target.closest('[data-increase]')) return changeQuantity(item.dataset.key, 1);
        if (event.target.closest('[data-decrease]')) return changeQuantity(item.dataset.key, -1);
        if (event.target.closest('[data-remove-item]')) { saveCart(getCart().filter((candidate) => candidate.key !== item.dataset.key)); updateBadge(); renderCart(); showNotice('Item removido do carrinho.'); return; }
        if (event.target.closest('[data-clear-cart]')) { saveCart([]); updateBadge(); renderCart(); showNotice('Carrinho limpo.'); return; }
        if (event.target.closest('[data-checkout]')) iniciarCheckout(event.target.closest('[data-checkout]'));
    });

    async function iniciarCheckout(button) {
        const cart = getCart();
        if (!cart.length) return;
        button.disabled = true;
        button.textContent = 'Redirecionando...';
        try {
            const response = await fetch(checkoutEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart.map(({ id, quantity, variations }) => ({ id, quantity, variations })) })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.checkoutUrl) throw new Error(data.message || 'Não foi possível iniciar o pagamento.');
            window.location.assign(data.checkoutUrl);
        } catch (error) {
            const message = error instanceof TypeError
                ? 'Não foi possível conectar ao pagamento. Inicie o servidor com npm start.'
                : error.message || 'Não foi possível iniciar o pagamento.';
            showNotice(message, true);
            button.disabled = false;
            button.textContent = 'Finalizar compra';
        }
    }
    updateBadge();
    renderCart();
})();
