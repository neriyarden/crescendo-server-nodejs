// packages imports
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
require('dotenv').config();

// routers imports
const artistsRouter = require('./routes/artists');
const eventsRouter = require('./routes/events');
const singInRouter = require('./routes/signIn');
const tagsRouter = require('./routes/tags');
const usersRouter = require('./routes/users');
const requestsRouter = require('./routes/requests');

const app = express();

app.use(cors({
    credentials: true,
    origin: 
        process.env.NODE_ENV === 'production'
        ? 'https://crescendo-events.web.app'
        : 'http://localhost:3000'
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, authorization'
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next()
})

// routers
app.use('/api/artists', artistsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/signIn', singInRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/users', usersRouter);
app.use('/api/requests', requestsRouter);

module.exports = app;
