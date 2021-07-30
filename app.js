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

// middleware
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// routers
app.use('/artists', artistsRouter);
app.use('/events', eventsRouter);
app.use('/signIn', singInRouter);
app.use('/tags', tagsRouter);
app.use('/users', usersRouter);
app.use('/requests', requestsRouter);

module.exports = app;
