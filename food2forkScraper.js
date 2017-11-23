var osmosis = require('osmosis');
var fs = require('fs');
var os = require('os');
var recipiesLinksFileName = 'recipiesLinks';

//all 4854
function getIngredients(limit) {
    osmosis
        .get('https://food2fork.com/index/4800')
        .paginate('div.pager > a', limit)
        .find('div.img-polaroid')
        .set({
            'link': 'a.recipe-link@href',
            'recipe': [
                osmosis
                .follow('a.recipe-link@href')
                // .find('div.about-container')
                .set({
                    title: 'h1.recipe-title',
                    rank: 'span.pull-center h4',
                    ingredient: ['li[itemprop="ingredients"]']
                })
            ]
        })
        .data(function (recipe) {
            var recipeJSON = JSON.stringify(recipe);
            fs.appendFile(recipiesLinksFileName, recipeJSON + os.EOL);
        })
        // 
        .done(function () {
            console.log('Done===');
        })
        .log(console.log)
        .error(console.log)
        .debug(console.log);
}