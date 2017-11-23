var readline = require('readline');
var fs = require('fs');
var os = require('os');
var BreakException = {};
var removeExtraSpaces = '/(\s\s+)/g';
var removeDash = '/(\s-\s)/g';
var removeInSquares = /(\(.*?\))/g;
var removeNonWD = /([^\w\s]|\d)/g;

Array.prototype.clean = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

var getUniqueWordsFromIngredients = function() {
    getRecipes()
    .then(
    recipes => {
        var wordsSet = new Set();
        var stream = fs.createWriteStream("uniqueWords", { flags: 'a' });
        recipes.forEach(function (r) {
            var recipe = r.recipe;
            var ingredients = recipe.ingredient;
            for (var i = 0; i < ingredients.length; i++) {
                var ingredient = ingredients[i];
                ingredient = ingredient.toLowerCase();
                ingredient = ingredient.replace(removeInSquares, '');
                ingredient = ingredient.replace(removeDash, ' ');
                ingredient = ingredient.replace(removeNonWD, ' ');
                ingredient = ingredient.replace(removeExtraSpaces, ' ');
                ingredient = ingredient.trim();
                if (ingredient.length > 100) {
                    continue;
                }
                var ingrs = ingredient.split(' ');
                for (var j = 0; j < ingrs.length; j++) {
                    if (ingrs[j].length > 1) {
                        wordsSet.add(ingrs[j]);
                    }
                }
            }
        }, this);
        wordsSet.forEach(function (w) {
            stream.write(w + os.EOL);
        });
        stream.end();
    },
    error => {
        console.log('ERROR RECIPES HANDLING.');
    }
    );
}

var getRecipes = function () {
    var recipes = new Map();
    var lineReader = readline.createInterface({
        input: fs.createReadStream('recipiesLinks2')
    });
    var promise = new Promise((resolve, reject) => {
        lineReader.on('line', function (recipeStr) {
            recipeStr = recipeStr.replace(/"recipe":\[/, '"recipe":');
            recipeStr = recipeStr.replace(/\]\}\]\}/, ']}}');
            var recipe = JSON.parse(recipeStr);
            if (!recipes.has(recipe.link)) {
                recipes.set(recipe.link, recipe);
            }
        });

        lineReader.on('close', () => {
            resolve(recipes);
        });
    });
    return promise;
}

var getHandledIngredients = function() {
    var recipes = new Set();
    var lineReader = readline.createInterface({
        input: fs.createReadStream('HandledIngredients')
    });
    var promise = new Promise((resolve, reject) => {
        lineReader.on('line', function (ingr) {
            recipes.add(ingr.trim());
        });

        lineReader.on('close', () => {
            resolve(recipes);
        });
    });
    return promise;
}

var getHandledRecipes = function(params) {
    var recipes = [];
    var lineReader = readline.createInterface({
        input: fs.createReadStream('HandledRecipes')
    });
    var promise = new Promise((resolve, reject) => {
        lineReader.on('line', function (rec) {
            recipes.push(JSON.parse(rec));
        });

        lineReader.on('close', () => {
            resolve(recipes);
        });
    });
    return promise;
}

var sortWords = function() {
    var words = [];
    var lineReader = readline.createInterface({
        input: fs.createReadStream('uniqueWords')
    });

    lineReader.on('line', function (word) {
        words.push(word);
    });
    
    lineReader.on('close', () => {
        words.sort();
        var stream = fs.createWriteStream("sortedWords", { flags: 'a' });
        words.forEach(function (w) {
            stream.write(w + os.EOL);
        });
    });
}

var handleRecipes = function () {
    getRecipes()
        .then(
        recipes => {
            getHandledIngredients()
                .then(
                ingres => {
                    var stream = fs.createWriteStream("HandledRecipes", { flags: 'a' });
                    recipes.forEach(function (r) {
                        var recipe = r.recipe;
                        var ingredients = recipe.ingredient;
                        for (var i = 0; i < ingredients.length; i++) {
                            var ingredient = ingredients[i];
                            ingredient = ingredient.toLowerCase();
                            ingredient = ingredient.replace(removeInSquares, '');
                            ingredient = ingredient.replace(removeDash, ' ');
                            ingredient = ingredient.replace(removeNonWD, ' ');
                            ingredient = ingredient.replace(removeExtraSpaces, ' ');
                            ingredient = ingredient.trim();

                            var ingrs = ingredient.split(' ');
                            var includes = false;
                            var j = 0, k = 0;
                            
                            try {
                                for (; j < ingrs.length; j++) {
                                    ingres.forEach(function (ingre) {
                                        var ingr1 = ingrs[j].trim();
                                        var ingr2 = ingre.trim();
                                        if (ingr1 == ingr2) {
                                            if (!ingredients.includes(ingr2)) {
                                                includes = true;
                                                ingredients[i] = ingr2;
                                                throw BreakException;
                                            }
                                        }
                                    });
                                }
                            } catch (e) {
                                if (e != BreakException) {
                                    throw e;
                                }
                            }
                            
                            if (!includes) {
                                delete ingredients[i];
                            }
                        }
                        ingredients.clean(undefined);
                    });
                    recipes.forEach(function(rec) {
                        stream.write(JSON.stringify(rec) + os.EOL);
                    });
                    stream.end();
                },
                error => {
                    console.log('ERROR RECIPES HANDLING.');
                }
                )
        },
        error => {
            console.log('ERROR RECIPES HANDLING.');
        }
        );
}

var getProbabilities = function (n) {
    var promise = new Promise((resolve, reject) => {
        getHandledRecipes()
            .then(
            recipes => {
                var probabilitiesMap = new Map();
                var count = 0;
                recipes.forEach(function (r) {
                    var recipe = r.recipe;
                    var ingredients = recipe.ingredient;
                    ingredients.forEach(function (ingr) {
                        if (probabilitiesMap.has(ingr)) {
                            var prob = probabilitiesMap.get(ingr);
                            probabilitiesMap.set(ingr, prob + 1);
                        } else {
                            probabilitiesMap.set(ingr, 1);
                        }
                        count++;
                    });
                });
                var probabilitiesArray = [];
                for (var x of probabilitiesMap) {
                    probabilitiesArray.push(x);
                }

                probabilitiesArray.sort(function (x, y) {
                    return y[1] - x[1];
                });
                resolve(probabilitiesArray);
                try {
                    probabilitiesArray.forEach(function (prob, i) {
                        if (i == n) {
                            throw BreakException;
                        }
                        console.log(prob[0] + ': - ' + prob[1] / count * 100);
                    });
                } catch (e) {
                    if (e != BreakException) {
                        throw e;
                    }
                }
                console.log(count);
            },
            error => {
                console.log('ERROR RECIPES HANDLING.');
            }
            )
    });
    return promise;
};

module.exports = {
    getRecipes: getRecipes,
    sortWords: sortWords,
    handleRecipes: handleRecipes,
    getHandledIngredients: getHandledIngredients,
    getProbabilities: getProbabilities,
    getUniqueWordsFromIngredients: getUniqueWordsFromIngredients,
    getHandledRecipes: getHandledRecipes
}