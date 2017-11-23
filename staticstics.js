var rh = require('./recipesHandler');
var fs = require('fs');

var descendingRec = function(rec1, rec2) {
    return +rec2.recipe.rank - +rec1.recipe.rank;
}

var ascendingRec = function(rec1, rec2) {
    return +rec1.recipe.rank - +rec2.recipe.rank;
}

var getRecipes = function (ingredient) {
    var promise = new Promise((resolve, reject) => {
        var resultRecipes = [];
        rh.getHandledRecipes()
        .then(
            recipes => {
                for (var r of recipes) {
                    var recipe = r.recipe;
                    var ingrsOfRecipe = recipe.ingredient;
                    if (ingrsOfRecipe.includes(ingredient)) {
                        resultRecipes.push(r);
                    }
                }
                resolve(resultRecipes);
            }
        );
    });
    
    return promise;
}

var getTopBestRecipes = function(ingredient, n) {
    getRecipes(ingredient).then(
        recipes => {
            recipes.sort(descendingRec);
            var count = n != undefined ? n : '';
            console.log('Top ' + count + ' best recipes.');
            console.log('Ingredient: ' + ingredient);
            for (var i = 0; i < recipes.length; i++) {
                if (i == n) {
                    break;
                }
                console.log('Recipe link: ' + recipes[i].link + '. Rank: ' + recipes[i].recipe.rank);
            }
        }
    );
}

var getTopWorstRecipes = function(ingredient, n) {
    getRecipes(ingredient).then(
        recipes => {
            recipes.sort(ascendingRec);
            var count = n != undefined ? n : '';
            console.log('Top ' + count + ' worst recipes.');
            console.log('Ingredient: ' + ingredient);
            for (var i = 0; i < recipes.length; i++) {
                if (i == n) {
                    break;
                }
                console.log('Recipe link: ' + recipes[i].link + '. Rank: ' + recipes[i].recipe.rank);
            }
        }
    );
}

var getRankStability = function (ingredient) {
    getRecipes(ingredient)
    .then(
        recipes => {
            var totalRank = 0;
            for (rec of recipes) {
                totalRank += +rec.recipe.rank;
            }
            var averageRank = totalRank / recipes.length;
            var dispertion = 0;
            for (rec of recipes) {
                dispertion += Math.pow(+rec.recipe.rank - averageRank, 2);
            }
            console.log('Standard deviation of recipes with ingredient: ' + ingredient + ' = ' + Math.sqrt(dispertion / recipes.length));
        }
    )
}

var getReicpesByIngredients = function (ingredients, n) {
    rh.getHandledRecipes()
    .then(
        recipes => {
            var recipesWithIngredients = [];
            for (rec of recipes) {
                var contains = true;
                var recIngredients = rec.recipe.ingredient;
                for (ingr of ingredients) {
                    if (!recIngredients.includes(ingr)) {
                        contains = false;
                    }
                }
                if (contains) {
                    recipesWithIngredients.push(rec);
                }
            }
            recipesWithIngredients.sort(descendingRec);
            for (var rec of recipesWithIngredients) {
                console.log('Recipe link: ' + rec.link + '. Rank: ' + rec.recipe.rank);
            }
        }
    )
}

var getConditionProbability = function (ingredients) {
    rh.getHandledRecipes()
    .then(
        recipes => {
            var productPairs = [];
            
            ingredients.forEach(function(ingrPr, i) {
                productPairs[i] = [];
                ingredients.forEach(function(ingrSec, j) {
                    productPairs[i][j] = { primary: ingrPr, secondary: ingrSec,  probPr: 0, probSec: 0, probPrSec: 0, condProb: 0 };
                });
            });

            for (rec of recipes) {
                var recIngredients = rec.recipe.ingredient;
                productPairs.forEach(function(pairPr, i) {
                    productPairs.forEach(function(pairSec, j) {
                        var pair = productPairs[i][j];
                        if (recIngredients.includes(pair.primary)) {
                            pair.probPr++;
                        }
                        if (recIngredients.includes(pair.secondary)) {
                            pair.probSec++;
                        }
                        if (recIngredients.includes(pair.primary) && recIngredients.includes(pair.secondary)) {
                            pair.probPrSec++;
                        }
                    });
                });
            }

            productPairs.forEach(function(pairPr, i) {
                productPairs.forEach(function(pairSec, j) {
                    var pair = productPairs[i][j];
                    pair.condProb = pair.probPrSec / pair.probPr;
                });
            });
            
            var cellSize = 8;
            var paddedIngredients = ingredients.map(function(ingr) {
                return ingr.padStart(cellSize);
            });
            var logHeader = '|' + ''.padStart(cellSize) + '|' + paddedIngredients.join('|') + '|';
            var logLine = new Array(logHeader.length + 1).join('-');
            console.log(logLine);
            console.log(logHeader);
            console.log(logLine);
            paddedIngredients.forEach(function(ingrPr, i) {
                var condProbStr = '';
                paddedIngredients.forEach(function(ingrSec, j) {
                    condProbStr += (productPairs[i][j].condProb.toFixed(6) + '').padStart(cellSize) + '|';
                });
                console.log('|' + ingrPr + '|' + condProbStr);
                console.log(logLine);
            });
        }
    )
}

module.exports = {
    getTopBestRecipes: getTopBestRecipes,
    getTopWorstRecipes: getTopWorstRecipes,
    getRankStability: getRankStability,
    getReicpesByIngredients: getReicpesByIngredients,
    getConditionProbability: getConditionProbability
}