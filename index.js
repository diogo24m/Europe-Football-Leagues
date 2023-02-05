var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var http = require('http').Server(app);
var compression = require('compression');
var schedule = require("node-schedule");

require('dotenv').config();

var requests = require('./requests')();

var results = [];
requests.getLeagueLeaders(function (res) {
    results = res;
});
// Every day at 23:55
schedule.scheduleJob("*/55 0 * * *", function () {
    requests.getLeagueLeaders(function (res) {
        results = res;
    });
});

app.use(compression());

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use('/styles', express.static(__dirname + '/public/styles'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/icon', express.static(__dirname + '/public/icon'));
app.use('/manifest.json', express.static(__dirname + '/public/manifest.json'));
app.use('/browserconfig.xml', express.static(__dirname + '/public/browserconfig.xml'));

app.get('/data', function (req, res) {
    res.send(results);
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

http.listen(process.env.PORT || 80, function () {
    console.log('Listening on port: 80');
});