var express = require('express');
var app = express();
var myParser = require("body-parser")
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path+ 'with query' + JSON.stringify(request.query));
    next ();
});
app.get('/test',function (request, response, next) {
    response.send('I got a request for test')
})
app.post('/display_purchase.html',function (request, response, next) {
    response.send('this is your diplay purchase')
})

app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here
