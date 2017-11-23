var rh = require('./recipesHandler');
var st = require('./staticstics');


// st.getTopBestRecipes('eggs', 1);
// st.getTopWorstRecipes('eggs', 1);
var ingredients = ['sugar', 'flour', 'onion', 'cream', 'eggs', 'milk', 'lemon', 
    'egg', 'chicken', 'cheese', 'ginger', 'potatoes', 'parmesan', 'bread', 'rice'];

// for (var ingr of ingredients) {
//     st.getRankStability(ingr);
// }

st.getConditionProbability(ingredients);