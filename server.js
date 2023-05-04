const express = require('express');
const cors = require('cors');
const axios = require('axios');

const config = require('./config/db.config');
const Pool = require('pg').Pool
const pool = new Pool({
    user: config.USER,
    host: config.HOST,
    database: config.DB,
    password: config.PASSWORD,
    port: 5432,
});


const app = express();
const port = 2888;
app.use(cors({
    origin: '*'
}));
app.post('/', (request, response) => {
    response.json({ info: 'API endpoint for EDFDDP' });
});


getCategories = (request, response) => {
    pool.query('SELECT * FROM categories', (error, results) => {
        if (error || results == null) {
            console.log(error);
            return response.json([]);
        }
        return results.rows;
    })
}


app.get('/api/categories', getCategories);


app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});