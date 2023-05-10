async function postData(url, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
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

// Функция для получения списка всех напитков
async function getAllDrinks() {
    try {
        const response = await fetch('http://localhost:8228/drinks');
        const drinks = await response.json();
        return drinks;
    } catch (error) {
        console.error('Error retrieving drinks:', error);
    }
}

// Функция для добавления нового напитка
async function addDrink(event) {
    event.preventDefault();

    const name = document.getElementById('drinkName').value;
    const description = document.getElementById('drinkDescription').value;
    const price = document.getElementById('drinkPrice').value;
    const section = document.getElementById('drinkSection').value;

    if (name.trim() === '' || description.trim() === '' || price.trim() === '' || section.trim() === '') {
        alert('Please enter all fields.');
        return;
    }

    const newDrink = {
        name: name,
        description: description,
        price: parseInt(price),
        section: section
    };

    try {
        await postData('http://localhost:8228/drinks/add', newDrink);
        alert('Drink added successfully.');
        document.getElementById('drinkName').value = '';
        document.getElementById('drinkDescription').value = '';
        document.getElementById('drinkPrice').value = '';
        document.getElementById('drinkSection').value = '';
        loadDrinksTable();
    } catch (error) {
        console.error('Error adding drink:', error);
        alert('Something went wrong. Please try again later.');
    }
}

// Функция для удаления напитка
async function removeDrink(drinkId) {
    try {
        await postData('http://localhost:8228/drinks/remove?id=' + drinkId, {});
        alert('Drink removed successfully.');
        loadDrinksTable();
    } catch (error) {
        console.error('Error removing drink:', error);
        alert('Something went wrong. Please try again later.');
    }
}

// Функция для установки цены напитка
async function setDrinkPrice(drinkId, price) {
    const newPrice = prompt('Enter the new price for the drink:');

    if (newPrice === null) {
        return;
    }

    if (isNaN(newPrice) || newPrice.trim() === '') {
        alert('Invalid price. Please enter a valid number.');
        return;
    }

    const updatedDrink = {
        id: drinkId,
        price: parseInt(newPrice),
    };

    try {
        await postData('http://localhost:8228/drinks/setprice', updatedDrink);
        alert('Drink price updated successfully.');
        loadDrinksTable();
    } catch (error) {
        console.error('Error setting drink price:', error);
        alert('Something went wrong. Please try again later.');
    }
}

// Функция для загрузки таблицы с напитками
async function loadDrinksTable() {
    try {
        const drinks = await getAllDrinks();
        const tableBody = document.querySelector('.drink-table tbody');

        // Очищаем таблицу перед обновлением
        tableBody.innerHTML = '';

        // Создаем строки таблицы с данными о напитках
        drinks.forEach((drink) => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = drink.name;

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = drink.description;

            const priceCell = document.createElement('td');
            priceCell.textContent = drink.price;

            const sectionCell = document.createElement('td');
            sectionCell.textContent = drink.section;

            const actionsCell = document.createElement('td');

            const setPriceButton = document.createElement('button');
            setPriceButton.textContent = 'Set Price';
            setPriceButton.addEventListener('click', () => {
                setDrinkPrice(drink.id, drink.price);
            });
            actionsCell.appendChild(setPriceButton);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                removeDrink(drink.id);
            });
            actionsCell.appendChild(removeButton);

            row.appendChild(nameCell);
            row.appendChild(descriptionCell);
            row.appendChild(priceCell);
            row.appendChild(sectionCell);
            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error retrieving drinks:', error);
    }
}

// Функция для добавления нового пользователя
async function addUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (username.trim() === '' || password.trim() === '') {
        alert('Please enter username and password.');
        return;
    }

    const newUser = {
        username: username,
        password: password,
        role: role
    };

    try {
        if(role.value === "ADMIN"){
            await postData(`http://localhost:8228/auth/registerAdmin`, newUser);
        }else{
            await postData(`http://localhost:8228/auth/registerBarista`, newUser);
        }

        alert('User added successfully.');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        loadUsersTable();
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Something went wrong. Please try again later.');
    }
}

// Функция для загрузки таблицы с пользователями
async function loadUsersTable() {
    try {
        const users = await getData('http://localhost:8228/users');
        const tableBody = document.querySelector('.user-table tbody');
        // Очищаем таблицу перед обновлением
        tableBody.innerHTML = '';

// Создаем строки таблицы с данными о пользователях
        users.forEach((user) => {
            const row = document.createElement('tr');

            const usernameCell = document.createElement('td');
            usernameCell.textContent = user.username;

            const roleCell = document.createElement('td');
            roleCell.textContent = user.role;

            row.appendChild(usernameCell);
            row.appendChild(roleCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
    }
}

// Обработчик события отправки формы для добавления напитка
document.getElementById('addDrinkForm').addEventListener('submit', addDrink);

// Обработчик события отправки формы для добавления пользователя
document.getElementById('addUserForm').addEventListener('submit', addUser);

// Загружаем таблицы с напитками и пользователями при загрузке страницы
loadDrinksTable();
loadUsersTable();