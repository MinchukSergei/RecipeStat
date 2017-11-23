var rh = require('./recipesHandler');
var st = require('./staticstics');

rh.getProbabilities(10);
st.getTopBestRecipes('chicken', 1);
st.getTopWorstRecipes('chicken', 1);

var ingredients = ['sugar', 'flour', 'onion', 'cream', 'eggs', 'milk', 'lemon', 'egg', 'chicken', 'cheese'];
for (var ingr of ingredients) {
    st.getRankStability(ingr);
}
st.getConditionProbability(ingredients);

var ingredients = ['sugar', 'flour', 'onion', 'cream', 'eggs'];
st.getReicpesByIngredients(ingredients, 5);
