const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const errorHandler = require('express-error-handler');

const app = express();
const mongoose = require('mongoose');

const config = require('./config/mongodb');
const PORT = process.env.PORT || 3000;

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err) {
  console.log(err);
});
const handler = errorHandler({
  static: {
    '404': './public/404ERROR.html',
    '500': '500ERROR.html'
  }
});

app.use(
  session({
    secret: 'AaryaSA',
    resave: true,
    saveUninitialized: false,
    ephemeral: true
  })
);

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use(express.static(path.join(__dirname, '/public')));

let home = require('./routes/home');
app.use('/', home);

let users = require('./routes/users');
app.use('/users', users);

let api = require('./routes/api');
app.use('/api', api);

let update = require('./routes/update');
app.use('/update', update);

let chats = require('./routes/chats');
app.use('/chats', chats);

app.use(errorHandler.httpError(404));
app.use(errorHandler.httpError(500));
app.use(handler);

app.listen(PORT, () => {
  console.log('Server listening on port 3000...');
});
