let cart = [];
async function postData(url, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Something went wrong');
    }

    return 0;

}
// Функция для создания карточки напитка
function createDrinkCard(drink) {
    const card = document.createElement('div');
    card.classList.add('drink-card');
    card.dataset.drinkId = drink.id;
    const image = document.createElement('img');
    image.src = `${drink.name}.jpeg`;
    image.height=300
    image.width=200
    image.alt = drink.name;
    card.appendChild(image);

    const name = document.createElement('h3');
    name.textContent = drink.name;
    card.appendChild(name);

    const description = document.createElement('p');
    description.textContent = drink.description;
    card.appendChild(description);

    const price = document.createElement('p');
    price.textContent = `Цена: ${drink.price} руб.`;
    card.appendChild(price);

    const addToCartButton = document.createElement('button');
    addToCartButton.textContent = 'Добавить в корзину';
    addToCartButton.addEventListener('click', () => {
        addToCart(drink.id);
    });
    card.appendChild(addToCartButton);

    return card;
}

// Функция для добавления напитка в корзину
function addToCart(drinkId) {
    const drink = drinkId;
    if (drink) {
        cart.push(drink);
        updateCart(cart);
    }
}

async function placeOrder(name) {
    try {
        url = `http://localhost:8228/orders/add?name=${name}&drinkIds=`;
        for(drinkId in cart){
            url += cart[drinkId].toString() + ',';
        }
        url = url.slice(0, -1);
        await postData(url);
        // Успешно оформлен заказ, можно выполнить необходимые действия, например, обновить страницу или очистить корзину
        cart = [];
        await loadOrders();
        updateCart(cart)
        // Можно добавить логику для обновления визуализации корзины, если необходимо
    } catch (error) {
        console.error('Error placing order:', error);
        // Обработка ошибки при оформлении заказа
    }
}


// Функция для создания элемента списка заказов
function createOrderItem(order) {
    const item = document.createElement('li');
    item.textContent = `Заказ №${order.id}: ${order.name}`;

    return item;
}

// Функция для загрузки списка напитков
async function loadDrinks() {
    const drinks = await getAllDrinks();

    const menuContainer = document.querySelector('.menu-container');
    menuContainer.innerHTML = '';

    drinks.forEach(drink => {
        const card = createDrinkCard(drink);
        menuContainer.appendChild(card);
    });
}

// Функция для загрузки списка заказов
async function loadOrders() {
    const orders = await getAllOrders();

    const ordersContainer = document.querySelector('.orders-container');
    ordersContainer.innerHTML = '';

    const list = document.createElement('ul');
    orders.forEach(order => {
        const item = createOrderItem(order);
        list.appendChild(item);
    });

    ordersContainer.appendChild(list);
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadDrinks();
    await loadOrders();
});
async function getAllDrinks() {
    try {
        const response = await fetch('http://localhost:8228/drinks');
        const drinks = await response.json();
        return drinks;
    } catch (error) {
        console.error('Error retrieving drinks:', error);
    }
}
document.getElementById('placeOrderButton').addEventListener('click', () => {
    event.preventDefault();
    const name = document.getElementById('customerName').value;
    placeOrder(name);
});
async function getAllOrders() {
    try {
        const response = await fetch('http://localhost:8228/orders/all');
        const orders = await response.json();
        return orders;
    } catch (error) {
        console.error('Error retrieving orders:', error);
    }
}

function createCartItem(drink) {
    const item = document.createElement('li');
    item.textContent = drink;
    return item;
}

function updateCart(drinks) {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = '';

    drinks.forEach(drink => {
        const item = createCartItem(drink);
        cartItems.appendChild(item);
    });
}

setInterval(async function () {
    await loadOrders();
}, 3000);