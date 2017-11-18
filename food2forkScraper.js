var osmosis = require('osmosis');
var fs = require('fs');
var os = require('os');
var readline = require('readline');
var recipiesLinksFileName = 'recipiesLinks';

function getIngredients(start, limit) {
    osmosis
        .get('https://food2fork.com/index/' + start)
        .find('div.img-polaroid')
        .set({
            'link': 'a.recipe-link@href',
        })
        .data(function (data) {
            fs.appendFile(recipiesLinksFileName, data.link + os.EOL);
        })
        .paginate('div.pager + a@href', limit)
        .done(function () {
            console.log('Done===');
        });
}

// function extractIngredients() {
//     var fileRL = readline.createInterface({
//         input: fs.open(recipiesLinksFileName, 'r')
//     });
//     fileRL.on('line', function(line) {
//         osmosis
//         .get('https://food2fork.com' + line)
//         .
//     })
// }

//all 4854
getIngredients(1, 4);