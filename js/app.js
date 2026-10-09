// const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';
const API_BASE = 'https://www.themealdb.com/api/json/v1/1/';
const RANDOM_API = `${API_BASE}random.php`;

// Змінна для підрахунку згенерованих рецептів
let count = 0;

// Вибираємо необхідні контейнери та кнопку зі сторінки
const resultContainer = document.querySelector('#recipe-result');
const historyCount = document.querySelector('#history-count');

const form = document.querySelector('#recipe-filter-form');
const vegCheckbox = document.querySelector('#vegOnly');
const dishAreaSelect = document.querySelector('#dishArea');
const generateButton = document.querySelector('#main_btn');
const statusContainer = document.querySelector('#recipe-status');

// Вибирає випадковий елемент із масиву.
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

// Надсилає запит і перевіряє HTTP-статус відповіді.
async function fetchJson(url){
    const response = await fetch(url);

    if (!response.ok){
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}


// Перевіряє, чи API справді повернув масив рецептів.
function getMeals(data){
    if (!data || !Array.isArray(data.meals) || data.meals.length === 0){
        throw new Error('NO_MEALS');
    }

    return data.meals;
}


// Повертає повну інформацію про один випадково вибраний рецепт.
async function getRecipe(){
    const selectedArea = dishAreaSelect.value;
    const isVegOnly = vegCheckbox.checked;

    // Без фільтрів використовуємо саме random.php
    if (!selectedArea && !isVegOnly){
        const data = await fetchJson(RANDOM_API);
        return getMeals(data)[0];
    }

    let meals = [];

    // Якщо вибрана тільки кухня світу.
    if(selectedArea && !isVegOnly){
        const data = await fetchJson(`${API_BASE}filter.php?a=${encodeURIComponent(selectedArea)}`);

        meals = getMeals(data);
    }
    // Якщо вибрані тільки вегетаріанські страви.
    else if (!selectedArea && isVegOnly){
        const data = await fetchJson(`${API_BASE}filter.php?c=Vegetarian`);

        meals = getMeals(data);
    }
    // Якщо вибрані і кухня, і вегетаріанські страви.
    else{
        const areaData = await fetchJson(`${API_BASE}filter.php?a=${encodeURIComponent(selectedArea)}`);
        const vegetarianData = await fetchJson(`${API_BASE}filter.php?c=Vegetarian`);

        const areaMeals = getMeals(areaData);
        const vegetarianMeals = getMeals(vegetarianData);
        const vegetarianIds = new Set(vegetarianMeals.map(meal => meal.idMeal));

        // Залишаємо рецепти, які є в обох списках.
        meals = areaMeals.filter(meal => vegetarianIds.has(meal.idMeal));

        if(meals.length === 0){
            throw new Error('NO_MATCHING_MEALS');
        }
    }


    // filter.php повертає короткий список, тому отримуємо повний рецепт за ID.
    const randomMeal = pickRandom(meals);
    const detailsData = await fetchJson(`${API_BASE}lookup.php?i=${encodeURIComponent(randomMeal.idMeal)}`);

    return getMeals(detailsData)[0];
}

// Функція рендеру картки на сторінку
function renderRecipe(meal){
    // Створюємо нові HTML-теги для картки
    const card = document.createElement('article');
    const img = document.createElement('img');
    const title = document.createElement('h3');
    const category = document.createElement('p');
    const instructionsTitle = document.createElement('h4');
    const instructions = document.createElement('p');

    // Наповнюємо теги даними з об'єкта
    img.src = meal.strMealThumb;
    img.alt = `${meal.strMealThumb} фото`;
    title.textContent = meal.strMeal;
    const details = [meal.strArea, meal.strCategory].filter(Boolean);
    category.className = 'meal-category';
    category.textContent = details.join(' · ');

    instructionsTitle.textContent = 'Як приготувати';
    instructions.className = 'meal-instructions';
    instructions.textContent = meal.strInstructions || 'Інструкція для цієї страви відсутня';

    if (meal.category === 'Vegetarian' || meal.strCategory === 'Vegan'){
        card.classList.add('vegetarian');
    }

    // Збираємо картку докупи і вставляємо у контейнер
    card.append(img, title, category, instructionsTitle, instructions);
    resultContainer.replaceChildren(card);

    // Оновлюємо лічильник
    // count++;
    // historyCount.textContent = count;
}

function showLoading(isLoading){
    generateButton.disabled = isLoading;

    if(isLoading){
        statusContainer.textContent = 'Завантажується рецепт...';
        statusContainer.className = 'status-loading';
    } else if (statusContainer.classList.contains('status-loading')){
        clearStatus();
    }
}

function showError(message){
    statusContainer.textContent = message;
    statusContainer.className = 'status-error';
}

function clearStatus() {
    statusContainer.textContent = '';
    statusContainer.className = '';
}


// Кожне натискання кнопки виконує новий запит до API.
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(true);

    try{
        const meal = await getRecipe();
        renderRecipe(meal);

        count++;
        historyCount.textContent = count;
        clearStatus();
    } catch(error){
        console.error(error);

        if (error.message === 'NO_MATCHING_MEALS') {
            showError('За цими фільтрами рецептів не знайдено. Зміни фільтри й спробуй ще раз.');
        } else if (error.message === 'NO_MEALS') {
            showError('API не повернув рецепт. Спробуй натиснути кнопку ще раз.');
        } else {
            showError('Не вдалося завантажити рецепт. Перевір інтернет і спробуй ще раз.');
        }
    } finally {
        showLoading(false);
    }
});
