// Функция для отправки POST-запроса


async function postData(url) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Something went wrong');
    }

    return 0;

}

// Функция для отправки GET-запроса
async function getData(url) {
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }

    });

    if (!response.ok) {
        throw new Error('Something went wrong');
    }

    return response.json();
}

// Функция для создания элемента списка заказов
function createOrderElement(order, isAssigned) {
    const orderElement = document.createElement('li');
    orderElement.innerText = order.name;
    orderElement.className = "order-item";
    orderElement.dataset.orderId = order.id;
    if (!isAssigned)
        orderElement.dataset.assignedBarista = '';
    else
        orderElement.dataset.assignedBarista = localStorage.getItem("baristaId");
    // Обработчик события при нажатии на элемент списка заказов
    orderElement.addEventListener('click', (event) => {
        showOrderDetails(event, order);
    });
    return orderElement;
}

// Функция для отображения списка заказов
function displayOrders(orders, listId, isAssigned) {
    const ordersList = document.getElementById(listId);
    ordersList.innerHTML = '';
    orders.forEach((order) => {
        const orderElement = createOrderElement(order, isAssigned);
        ordersList.appendChild(orderElement);
    });
}

// Функция для отображения деталей заказа
function showOrderDetails(event, order) {
    const orderDetailsList = document.getElementById('orderDetails');
    orderDetailsList.innerHTML = '';
    order.drinks.forEach((drink) => {
        const drinkElement = document.createElement('li');
        drinkElement.innerText = drink.name;
        drinkElement.className = "order-item";
        orderDetailsList.appendChild(drinkElement);
    });
    if (event.target.dataset.assignedBarista === "") {
        let selectButton = createSelectButton(event.target.dataset.orderId);
        orderDetailsList.appendChild(selectButton);
    } else {
        let removeButton = createRemoveButton(event.target.dataset.orderId);
        let finishButton = createFinishButton(event.target.dataset.orderId);
        orderDetailsList.appendChild(removeButton);
        orderDetailsList.appendChild(finishButton);
    }
}

// Функция для загрузки и отображения незабранных заказов
async function loadUnclaimedOrders() {
    try {
        const unclaimedOrders = await getData('http://localhost:8228/orders');
        displayOrders(unclaimedOrders, 'unclaimedOrders', false);
    } catch (error) {
        console.error(error);
    }
}

// Функция для загрузки и отображения ваших заказов
async function loadAssignedOrders() {
    try {
        const baristaId = localStorage.getItem("baristaId"); // Замените на ваш ID баристы
        const assignedOrders = await getData(`http://localhost:8228/orders/${baristaId}`);
        displayOrders(assignedOrders, 'assignedOrders', true);
    } catch (error) {
        console.error(error);
    }
}


// Загрузка незабранных заказов и ваших заказов при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    loadUnclaimedOrders()
        .then(() => {
            loadAssignedOrders();
        })
        .catch((error) => {
            console.error(error);
        });
});

// Функция для создания элемента списка напитков


// Добавление обработчика события для каждого элемента списка незабранных заказов
const unclaimedOrdersList = document.getElementById('unclaimedOrders');
unclaimedOrdersList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        //handleUnclaimedOrderClick(event);
    }
});


function createFinishButton(orderId) {
    const button = document.createElement('button');
    button.innerText = 'Finish';
    button.className = "button"
    button.addEventListener('click', () => {
        removeOrder(orderId);
    });
    return button;
}

function createSelectButton(orderId) {
    const button = document.createElement('button');
    button.innerText = 'Select';
    button.className = "button"
    button.addEventListener('click', () => {
        selectOrder(orderId, localStorage.getItem("baristaId"));
    });
    return button;
}

function createRemoveButton(orderId) {
    const button = document.createElement('button');
    button.innerText = 'Remove';
    button.className = "button"
    button.addEventListener('click', () => {
        removeOrder(orderId);
    });
    return button;
}

// Функция для удаления заказа
async function removeOrder(orderId) {
    const token = localStorage.getItem('token');
    try {
        await postData(`http://localhost:8228/orders/remove?orderId=${orderId}`);
    } catch (error) {
        console.log("ERROR");
    }
    loadUnclaimedOrders();
    loadAssignedOrders();
    document.getElementById('orderDetails').innerHTML = "";
}

async function selectOrder(orderId, baristaId) {
    // Выполнить запрос на удаление заказа по orderId
    try {
        await postData(`http://localhost:8228/orders/assign?baristaId=${baristaId}&orderId=${orderId}`);
    } catch (error) {
        console.log("ERROR");
    }
    loadUnclaimedOrders();
    loadAssignedOrders();
    document.getElementById('orderDetails').innerHTML = "";
}

setInterval(function() {
    loadUnclaimedOrders();
    loadAssignedOrders();
}, 3000);
