//importing express to use the all functionality of express
const express = require('express');
const port = 8000;
const app = express();

const fs = require('fs');

const tododata = require('./config/mongoose');
const userschema = require('./model/todoschema');
const profileschema = require('./model/users');
// const passport = require('passport');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
const readline = require('readline');
const { google } = require('googleapis');
// const crypto = require('crypto');
//importing mongoose and user schema as exported from config and model folder
// const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
//setting up view engine 
app.set('view engine', 'ejs');
app.set('views', './view');

app.use(express.urlencoded());
app.use(express.static('static'));
//searching in usersschema and pass that data into home.ejs view file
// app.use(session({
//     name: 'calender',
//     // TODO change the secret before deployment in production mode
//     secret: "blashsomething",
//     saveUninitialized: false,
//     resave: false,
//     cookie: {
//         maxAge: (1000 * 60 * 100)
//     },
//     store: new MongoStore({
//             mongooseConnection: profileschema,
//             autoRemove: 'disabled'

//         },
//         function(err) {
//             console.log(err || 'connect-mongodb setup ok');
//         }
//     )
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(passport.setAuthenticatedUser);
app.get('/', function(req, res) {
    userschema.find({}, function(err, todotimetable) {
        if (err) {
            console.log('ERROR OCCURRED IN FETCHING DATABASE');
            return;
        } else {
            res.render('signup', {
                title: 'Calendify | Sign Up',
                error: 'Enter at least 8 character long Password'
            });
        }
    })

})


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
            console.log('No upcoming events found.');
        }
    });
}


app.post('/create', function(req, res) {
    //console.log(req.body.email);
    console.log(req.body);
    if (req.body.password != req.body.confirm_password) {
        return res.render('signup', {
            title: 'Calendify | Sign Up',
            error: 'Password Not Match Please! Re-enter Password'
        })
        return res.redirect('back');
    }
    if (req.body.password.length < 8) {
        return res.render('signup', {
            title: 'Calendify | Sign Up',
            error: 'Enter 8 character long Password Only'
        })
        return res.redirect('back');
    }
    profileschema.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
            profileschema.create({
                email: req.body.email,
                password: req.body.password,
                name: req.body.name

            }, function(err, user) {
                if (err) {
                    console.log('ERROR OCCURRED DURING CREATING THE SCHEMA');
                }
                console.log('******************', user);
                // res.redirect('back');
                return res.render('profile', {
                    title: 'Calendify | Profile',
                    prof: user,

                });
            })
        } else {
            return res.render('signup', {
                title: 'Calendify | Sign Up',
                error: "Already Registered"
            })
        }
    })
})


app.get('/signin', function(req, res) {
    profileschema.find({}, function(err, user) {
        if (err) {
            console.log("ERROR IN SIGN-IN");
        } else {
            return res.render('signin', {
                title: "Calendify",
                prof: user
            })
        }
    })
})

app.get('/profile/signin', function(req, res) {
    userschema.find({}, function(err, user) {
        if (err) {
            console.log("PAPP");
        }
        return res.render('home', {
            title: "Calendify | Profile",
            todo: user
        })
    })
})

//to use the css and javascript files use express function static

app.get('/home', function(req, res) {

    userschema.find({}, function(err, todotimetable) {
        if (todotimetable) {

            res.render('home', {
                title: 'Calendify | Home',
                todo: todotimetable
            });
        } else {
            return res.render('signup', {
                title: 'Calendify | Sign Up',
                error: 'Sign Up first'
            })
        }
    })
})


app.post('/timetable', function(req, res) {
    // let idstring = "";

    userschema.create({
        description: req.body.description,
        category: req.body.category,
        date: req.body.date,
        timefrom: req.body.timefrom,
        timeto: req.body.timeto,
        availableday: req.body.availableday
    }, function(err, newtimetable) {
        if (err) {
            console.log('ERROR OCCURRED DURING CREATING THE SCHEMA');
        }
        console.log('******************', newtimetable);
        res.redirect('back');
    })

})

//Controller to remove task as marked by the user
app.post('/removelist', function(req, res) {
    console.log(req.body.task);
    let id = req.body.task;
    userschema.findByIdAndDelete(id, function(err) {
        if (err) {
            console.log('errorerror');
            return;
        }
        res.redirect('back');
    })
});

app.get('/logout', function(req, res) {
    // req.logout();
    return res.redirect('/');
});

//creting server on port number 8000
app.listen(port, function(err) {
    if (err) {
        console.log('ERROR-->', err);
    }
    console.log('TO DO APP SERVER IS RUNNING SUCCESSFULLY');
})
