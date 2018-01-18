var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./api/model/db');
var config = require('./config');

var index = require('./api/routes/index');
var user = require('./api/routes/user');
var record = require('./api/routes/record');

var port = 4000;

var app = express();

//View Engine
app.set('views', path.join(__dirname, 'client/views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Set Static Folder
app.use(express.static(path.join(__dirname, 'client')));

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', index);
app.use('/user', user);
app.use('/record', record);

// set up our one route to the index.html file
app.get('*', function (req, res){
    res.render(path.join(__dirname+'/client/views/main.ejs'));
});

app.listen(port, function() {
    console.log("Server started on port " + port);
});