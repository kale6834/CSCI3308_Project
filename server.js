var express = require('express'); //Ensure our express framework has been added
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// app.use(express.static(path.join(__dirname, '/css')));
//Create Database Connection
var pgp = require('pg-promise')();


var dbConfig = process.env.DATABASE_URL;


//var dbConfig = postgres://fokxovrlpssdqp:f1752a76d748490250359ff737c6f26e08a07e47da5b765d0afdeb34edf96166@ec2-34-193-232-231.compute-1.amazonaws.com:5432/d23tobmqht1lf5
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
    // console.log(username, password);
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

app.post('/signup/select_user', function(req, res) {
    var username = req.body.username;
    var firstname = req.body.firstName;
    var lastname = req.body.lastName;
    var password = req.body.password;
    var insert_statement = "INSERT INTO players(username, firstname, lastname, password) VALUES('" + username + "','" + firstname + "','" + lastname + "','" + password + "');";
    // console.log(username, firstname, lastname, password);
    // console.log(insert_statement);
    db.task('get-everything', task => {
            return task.batch([
                task.any(insert_statement)
            ]);
        })
        .then(info => {
            res.render('homepage', {
                name: username
            })
        })
        .catch(error => {
            // display error message in case an error
            console.log(error);
            res.render('homepage', {
                title: 'Home Page'
            })
        });

});


app.post('/homepage/create_user', function(req, res) {
    var charname = req.body.char_name;
    var charrace = req.body.char_race;
    var charclass = req.body.char_class;
    var charlevel = req.body.level;
    //var insert_statement = "INSERT INTO players(username, firstname, lastname, password) VALUES('" + username + "','" + firstname + "','" + lastname + "','" + password + "');";
    //insert statement needs to be changed, but we need to create this the new table first.
    db.task('get-everything', task => {
            return task.batch([
                task.any(insert_statement)
            ]);
        })
        .then(info => {
            res.render('homepage', {
                name: username
            })
        })
        .catch(error => {
            // display error message in case an error
            console.log(error);
            res.render('homepage', {
                title: 'Home Page'
            })
        });

});




app.get('/homepage', function(req, res) {
    var user = 'select username from players;';
    db.task('get-everything', task => {
            return task.batch([
                task.any(user)
            ]);
        })
        .then(info => {
            console.log(info);
            res.render('homepage', {
                my_title: "Home Page",
                name: info[0][0].username

            })
        })
        .catch(error => {
            // display error message in case an error
            console.log(error);
            res.render('homepage', {
                title: 'Home Page',
                name: ''
            })
        });
});

app.get('/meettheteam', function(req, res) {
    res.render('/meettheteam', {
        my_title: "Meet the team!"
    });
})
//connects to heroku port
app.listen(process.env.PORT);
// app.listen(3000);
