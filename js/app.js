// console.log('app.js підключено!');

const recipes = [
    { name: 'Печена редиска на соусі з Фети', timeMinutes: 30, vegetarian: true },
    { name: 'Кімчі з баклажанів по-корейськи', timeMinutes: 45, vegetarian: false },
    { name: 'Фарширований сиром перець', timeMinutes: 50, vegetarian: false },
    { name: 'Овочі з рисом та тофу в кисло-солодкому соусі', timeMinutes: 35, vegetarian: false },
    { name: 'Фарширований батат з квасолею зі сметаною та гуакамоле', timeMinutes: 40, vegetarian: true },
    { name: 'Веганський боул з нутом та овочами', timeMinutes: 20, vegetarian: true },
    { name: 'Бутерброди з нутом та «тунцем»', timeMinutes: 15, vegetarian: false },
    { name: 'Сирна веганська піца на багеті', timeMinutes: 25, vegetarian: true }
];

console.log('Масив рецептів:', recipes);

// Функція перебирає масив рецептів та виводить їх у консоль, позначаючи вегетаріанські страви
function displayRecipes(arrRecipes){
    for(const recipe of recipes){
        let lable = "";

        if(recipe.vegetarian === true){
            lable = "(вегетаріанська страва)";
        }

        console.log(`${recipe.name}${lable}: час ${recipe.timeMinutes} хв`);
    }
}

// Стрілкова функція приймає масив та повертає один випадковий елемент із нього
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const todayRecipe = pickRandom(recipes);

console.log("=== Випадковий рецепт на сьогодні ===");
console.log(`Пропоную приготувати: ${todayRecipe.name}`);