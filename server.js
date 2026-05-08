/*
const dns = require('node:dns'); for local development
dns.setServers(['8.8.8.8', '1.1.1.1']); for local development
*/

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const connectDB = require('./config/dbConn');

const app = express();
const PORT = process.env.PORT || 3500;

connectDB();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/states', require('./routes/states'));

app.all(/.*/, (req, res) => {
    res.status(404);

    if (req.accepts('html')) 
    {
        res.sendFile(path.join(__dirname, 'public', '404.html'));
    } 
    else if (req.accepts('json')) 
    {
        res.json({ error: '404 Not Found' });
    } 
    else 
    {
        res.type('txt').send('404 Not Found');
    }
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});