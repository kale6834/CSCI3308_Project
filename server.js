var express = require('express'); //Ensure our express framework has been added
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// app.use(express.static(path.join(__dirname, '/css')));
//Create Database Connection
var pgp = require('pg-promise')();


var dbConfig = process.env.DATABASE_URL;

// const dbConfig = {
//     host: 'localhost',
//     port: 5432,
//     database: 'finalprojectdb',
//     user: 'kaleilewis',
//     password: 'password'
// };



var db = pgp(dbConfig);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/')); //This line is necessary for us to use relative paths and access our resources directory
var session = require('express-session');
var path = require('path');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.get('/', function(req, res) {
    res.render('signup', {
        my_title: "Signup Page"
    });
    // response.sendFile(__dirname + '/S.D._Project/Front_end/signup.html', {
    //     my_title: "Login Page"
    // });
});

app.get('/login', function(req, res) {
    res.render('login', {
        my_title: "Login Page"
    });
})


app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    console.log(username, password);
    if (username && password) {
        var query = "SELECT * FROM players WHERE username ='" + username + "'AND password = '" + password + "'";
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
        response.render('homepage', {
            my_title: "Homepage"
        });
        // return response.redirect(__dirname + '/S.D._Project/Front_end/homepage.html');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

app.post('/signup/select_user', function(req, res) {
    var username = req.body.username;
    var firstname = req.body.firstName;
    var lastname = req.body.lastName;
    var password = req.body.psw;
    var insert_statement = "INSERT INTO players(username, firstname, lastname, password) VALUES('" + username + "','" +
        firstname + "','" + lastname + "'," + password + "');";
    db.task('get-everything', task => {
            return task.batch([
                task.any(insert_statement)
            ]);
        })
        .then(info => {
            res.render('homepage', {
                my_title: "Home Page",
                data: info[1],
                name: username
            })
        })
        .catch(error => {
            // display error message in case an error
            req.flash('error', err);
            res.render('homepage', {
                title: 'Home Page',
                data: '',
                name: ''
            })
        });

});

app.get('/homepage/select_user', function(req, res) {
    var username = req.query.player_choice;
    var list_players = 'select player_id, username from players;';
    var chosen_player = 'select * from players where player_id=' + username + ';';
    db.task('get-everything', task => {
            return task.batch([
                task.any(list_players),
                task.any(chosen_player)
            ]);
        })
        .then(info => {
            res.render('homepage', {
                my_title: "Home Page",
                players: info[0],
                name: info[0][1]

            })
            console.log(name)
        })
        .catch(error => {
            // display error message in case an error
            req.flash('error', err);
            res.render('homepage', {
                title: 'Home Page',
                data: '',
                name: ''
            })
        });
});


app.listen(process.env.PORT); //connects to heroku port

// app.listen(3000);