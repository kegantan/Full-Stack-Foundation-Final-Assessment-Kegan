//Load your dependancies
var express = require ("express");
var passport = require ("passport");
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

//Create an application
var app = express();
app.use(express.static(__dirname + "/public"));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

//Initialise mysql
var mysql = require("mysql");

//Load my dbconfig
var config = require ("./public/modules/dbconfig");

//Create a connection pool
var connPool= mysql.createPool(config);

//Passport Initialisation
//Sessions setup
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new FacebookStrategy({
        clientID: "1036110399805822",
        clientSecret: "0d499cd3c645cf32722d0723af30242f",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
},
    
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ facebookId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get('/auth/facebook',
    passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/', function (req, res) {
    res.send('index');});

app.get('/organise', function (req, res) {
    res.send('organise');});

app.get("/cat",function(req, res){
    console.info(">>> category %s", req.params.category);
    var cat = req.params.category;
    switch (cat) {
        case "shop":
            res.send.file('/shop.html');
            break;
        case "profile":
            res.send.file('/profile.html');
            break;
        case "book":
            connPool.getConnection(function(err, conn) {
                //If there are errors, report the error
                if (err) {
                    console.error("get connection error: %s", err);
                    res.send.file('/book.html');
                    return;
                }
                //Perform the query
                conn.query("select * from organise", function(err, rows){
                    if (err) {
                        console.error("query has error: %s", err);
                        res.send.file("book");
                        return;
                    }
                    //Render the template with rows as the context
                    res.render("/book.html", {
                        organise:rows
                    });
                    //IMPORTANT! Release the connection
                    conn.release();
                });
            });
            break;

        default:
            res.redirect("/");
    }
});

//Catch all a.k.a error handler
app.use(function(req, res, next) {
    console.error("File not found: %s", req.originalUrl);
    res.redirect("/");
});

app.set('port', process.env.APP_PORT || 3000);

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get ('port')+ '; press Ctrl-C to end')
});