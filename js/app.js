// Для виконання лабораторної роботи було обрано React 18,
// оскільки він дозволяє створювати інтерфейс за допомогою
// компонентів, керувати даними через стан (useState) та
// автоматично оновлювати сторінку після його зміни.
// Також React можна підключити через CDN без встановлення Node.js.

// const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';
const API_BASE = 'https://www.themealdb.com/api/json/v1/1/';
const RANDOM_API = `${API_BASE}random.php`;

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
async function getRecipe(selectedArea, isVegOnly){
    
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


// Перетворює відповідь API на зручний для компонента об'єкт.
function prepareRecipe(meal){
    return{
        id: meal.idMeal,
        name: meal.strMeal,
        type: meal.strCategory || 'Категорія не вказана',
        timeMinutes: null,
        area: meal.strArea || '',
        image: meal.strMealThumb || '',
        instructions: meal.strInstructions || 'Інструкція для цієї страви відсутня',
        isVegetarian:
            meal.strCategory === 'Vegetarian' ||
            meal.strCategory === 'Vegan'
    };
}


function RandomRecipeCard({recipe, onRegenerate, isLoading}){
    return (
        <article className={recipe.isVegetarian ? 'vegetarian' : ''}>
            <img
                src={recipe.image}
                alt={`${recipe.name} фото`}
            />

            <h3>{recipe.name}</h3>

            <p className="meal-category">
                {[recipe.area, recipe.type]
                .filter(Boolean)
                .join(' . ')}
            </p>

            {/* <p className="meal-time">
                {recipe.timeMinutes != null
                    ? `Час приготування: ${recipe.timeMinutes} хв`
                    : 'Час приготування не вказано в API'}
            </p> */}

            <h4>Як приготувати</h4>

            <p className="meal-instructions">
                {recipe.instructions}
            </p>

            <button
                type="button"
                id="main_btn"
                onClick={onRegenerate}
                disabled={isLoading}
            >
               Згенерувати рецепт 🎲
            </button>

        </article>
    );
}

// БАТЬКІВСЬКИЙ КОМПОНЕНТ УСЬОГО ГЕНЕРАТОРА.
function App() {

    // Масив поточного рецепта зберігається в стані React.
    const [recipes, setRecipes] = React.useState([]);

    const [selectedArea, setSelectedArea] = React.useState('');
    const [isVegOnly, setIsVegOnly] = React.useState(false);

    const [isLoading, setIsLoading] = React.useState(false);
    const [status, setStatus] = React.useState('');
    const [statusClass, setStatusClass] = React.useState('');

    const [count, setCount] = React.useState(0);

    // Лічильник у старому блоці історії розташований поза React.
    React.useEffect(() => {
        const historyCount = document.getElementById('history-count');

        if (historyCount) {
            historyCount.textContent = count;
        }
    }, [count]);


    // Завантажує рецепт і оновлює стан.
    async function regenerate(event) {

        if (event) {
            event.preventDefault();
        }

        setIsLoading(true);
        setStatus('Завантажується рецепт...');
        setStatusClass('status-loading');

        try {
            const meal = await getRecipe(
                selectedArea,
                isVegOnly
            );

            // Зберігаємо новий рецепт у стані React.
            setRecipes([prepareRecipe(meal)]);

            setCount(previousCount => previousCount + 1);

            setStatus('');
            setStatusClass('');

        } catch (error) {
            console.error(error);

            if (error.message === 'NO_MATCHING_MEALS') {
                setStatus(
                    'За цими фільтрами рецептів не знайдено. ' +
                    'Зміни фільтри й спробуй ще раз.'
                );
            } else if (error.message === 'NO_MEALS') {
                setStatus(
                    'API не повернув рецепт. Спробуй ще раз.'
                );
            } else {
                setStatus(
                    'Не вдалося завантажити рецепт. ' +
                    'Перевір інтернет і спробуй ще раз.'
                );
            }

            setStatusClass('status-error');

        } finally {
            setIsLoading(false);
        }
    }


    return (
        <>
            <div id="recipe-result">

                {recipes.map(recipe => (
                    <RandomRecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onRegenerate={regenerate}
                        isLoading={isLoading}
                    />
                ))}

            </div>

            <p
                id="recipe-status"
                className={statusClass}
                role="status"
                aria-live="polite"
            >
                {status}
            </p>

            <form
                id="recipe-filter-form"
                onSubmit={regenerate}
            >
                {recipes.length === 0 && (
                    <button
                        type="submit"
                        id="main_btn"
                        disabled={isLoading}
                    >
                        Згенерувати рецепт 🎲
                    </button>
                )}

                <div id="form-part">
                    <div id="filter-row">
                        <label htmlFor="dishArea">
                            Кухня світу:
                        </label>

                        <select
                            name="dishArea"
                            id="dishArea"
                            value={selectedArea}
                            onChange={event =>
                                setSelectedArea(event.target.value)
                            }
                        >
                            <option value="">
                                Будь-яка (Випадкова)
                            </option>

                            <option value="Italian">
                                Італійська
                            </option>

                            <option value="France">
                                Французька
                            </option>

                            <option value="Mexican">
                                Мексиканська
                            </option>

                            <option value="Chinese">
                                Китайська
                            </option>
                        </select>
                    </div>

                    <div id="checkbox-row">
                        <input
                            type="checkbox"
                            id="vegOnly"
                            name="vegOnly"
                            checked={isVegOnly}
                            onChange={event =>
                                setIsVegOnly(event.target.checked)
                            }
                        />

                        <label htmlFor="vegOnly">
                            Тільки вегетаріанські страви
                        </label>
                    </div>

                </div>
            </form>
        </>
    );
}



// Підключаємо React до секції генератора в HTML.
ReactDOM.createRoot(
    document.getElementById('generate_recipe')
).render(<App />);








// function renderRecipe(meal){
//     
//     // Створюємо нові HTML-теги для картки
//     // const card = document.createElement('article');
//     // const img = document.createElement('img');
//     // const title = document.createElement('h3');
//     // const category = document.createElement('p');
//     // const instructionsTitle = document.createElement('h4');
//     // const instructions = document.createElement('p');

//     // // Наповнюємо теги даними з об'єкта
//     // img.src = meal.strMealThumb;
//     // img.alt = `${meal.strMealThumb} фото`;
//     // title.textContent = meal.strMeal;
//     // const details = [meal.strArea, meal.strCategory].filter(Boolean);
//     // category.className = 'meal-category';
//     // category.textContent = details.join(' · ');

//     // instructionsTitle.textContent = 'Як приготувати';
//     // instructions.className = 'meal-instructions';
//     // instructions.textContent = meal.strInstructions || 'Інструкція для цієї страви відсутня';

//     // if (meal.category === 'Vegetarian' || meal.strCategory === 'Vegan'){
//     //     card.classList.add('vegetarian');
//     // }

//     // // Збираємо картку докупи і вставляємо у контейнер
//     // card.append(img, title, category, instructionsTitle, instructions);
//     // resultContainer.replaceChildren(card);

// }


// function showLoading(isLoading){
//     generateButton.disabled = isLoading;

//     if(isLoading){
//         statusContainer.textContent = 'Завантажується рецепт...';
//         statusContainer.className = 'status-loading';
//     } else if (statusContainer.classList.contains('status-loading')){
//         clearStatus();
//     }
// }

// function showError(message){
//     statusContainer.textContent = message;
//     statusContainer.className = 'status-error';
// }

// function clearStatus() {
//     statusContainer.textContent = '';
//     statusContainer.className = '';
// }


// // Кожне натискання кнопки виконує новий запит до API.
// form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     showLoading(true);

//     try{
//         const meal = await getRecipe();
//         renderRecipe(meal);

//         count++;
//         historyCount.textContent = count;
//         clearStatus();
//     } catch(error){
//         console.error(error);

//         if (error.message === 'NO_MATCHING_MEALS') {
//             showError('За цими фільтрами рецептів не знайдено. Зміни фільтри й спробуй ще раз.');
//         } else if (error.message === 'NO_MEALS') {
//             showError('API не повернув рецепт. Спробуй натиснути кнопку ще раз.');
//         } else {
//             showError('Не вдалося завантажити рецепт. Перевір інтернет і спробуй ще раз.');
//         }
//     } finally {
//         showLoading(false);
//     }
// });

