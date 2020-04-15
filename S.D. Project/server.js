var express = require('express'); //Ensure our express framework has been added
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();


// var dbConfig = "postgres://fokxovrlpssdqp:f1752a76d748490250359ff737c6f26e08a07e47da5b765d0afdeb34edf96166@ec2-34-193-232-231.compute-1.amazonaws.com:5432/d23tobmqht1lf5"; //connects to heroku database";

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'finalprojectdb',
    user: 'kaleilewis',
    password: 'password'
};



var db = pgp(dbConfig);
var session = require('express-session');
var path = require('path');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/Front_end/loginproject.html'));
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    console.log(username, password);
    if (username && password) {
        var query = "SELECT * FROM players WHERE name ='" + username + "'AND password = '" + password + "'";
        console.log(query);
        db.any(query)
            .then(function(results) {
                if (results.length > 0) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    response.redirect('/homepage');

                } else {
                    response.send('Incorrect Username and/or Password!');
                }
                response.end();

            })
            .catch(function(err) {
                // display error message in case an error
                console.log('error', err);
                response.send('error logging into database')
            });
    }
});

app.get('/homepage', function(request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

// app.listen(process.env.PORT); //connects to heroku port

app.listen(3000);