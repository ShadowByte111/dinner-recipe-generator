// console.log('app.js підключено!');

const recipes = [
    { name: 'Печена редиска на соусі з Фети', timeMinutes: 30, vegetarian: true, image: 'assets/img/dish1.png' },
    { name: 'Кімчі з баклажанів по-корейськи', timeMinutes: 45, vegetarian: false, image: 'assets/img/dish2.jpg' },
    { name: 'Фарширований сиром перець', timeMinutes: 50, vegetarian: false, image: 'assets/img/dish3.jpg' },
    { name: 'Овочі з рисом та тофу в кисло-солодкому соусі', timeMinutes: 35, vegetarian: false, image: 'assets/img/dish4.png' },
    { name: 'Фарширований батат з квасолею зі сметаною та гуакамоле', timeMinutes: 40, vegetarian: true, image: 'assets/img/dish5.png' },
    { name: 'Веганський боул з нутом та овочами', timeMinutes: 20, vegetarian: true, image: 'assets/img/dish6.png' },
    { name: 'Бутерброди з нутом та «тунцем»', timeMinutes: 15, vegetarian: false, image: 'assets/img/dish7.png' },
    { name: 'Сирна веганська піца на багеті', timeMinutes: 25, vegetarian: true, image: 'assets/img/dish8.png' }
];

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

// Вибираємо необхідні контейнери та кнопку зі сторінки
const resultContainer = document.querySelector('#recipe-result');
const historyCount = document.querySelector('#history-count');
const generateBtn = document.querySelector('#main_btn');

// Змінна для підрахунку згенерованих рецептів
let count = 0;

// Функція рендеру картки на сторінку
function renderRecipe(recipe){
    // Очищаємо контейнер від попереднього рецепта
    resultContainer.innerHTML = '';

    // Створюємо нові HTML-теги для картки
    const card = document.createElement('article');
    const img = document.createElement('img');
    const title = document.createElement('h3');
    const time = document.createElement('p');

    // Наповнюємо теги даними з об'єкта
    img.src = recipe.image;
    img.alt = `${recipe.name} фото`;
    title.textContent = recipe.name;
    time.textContent = `${recipe.timeMinutes} хв.`;

    // Додаємо атрибут та перевіряємо умову для класу
    card.setAttribute('data-time', recipe.timeMinutes);
    if (recipe.vegetarian){
        card.classList.add('vegetarian');
    }

    // Збираємо картку докупи і вставляємо у контейнер
    card.append(img, title, time);
    resultContainer.append(card);

    // Оновлюємо лічильник
    count++;
    historyCount.textContent = count;
}

// Прив'язуємо дію до кліку по кнопці
generateBtn.addEventListener('click', () => {
    const randomRecipe = pickRandom(recipes);
    renderRecipe(randomRecipe);
})





// console.log('Масив рецептів:', recipes);

// Функція перебирає масив рецептів та виводить їх у консоль, позначаючи вегетаріанські страви
// function displayRecipes(arrRecipes){/
//     for(const recipe of recipes){
//         let lable = "";

//         if(recipe.vegetarian === true){
//             lable = "(вегетаріанська страва)";
//         }

//         console.log(`${recipe.name}${lable}: час ${recipe.timeMinutes} хв`);
//     }
// }

// Стрілкова функція приймає масив та повертає один випадковий елемент із нього
// const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

// const todayRecipe = pickRandom(recipes);

// console.log("=== Випадковий рецепт на сьогодні ===");
// console.log(`Пропоную приготувати: ${todayRecipe.name}`);