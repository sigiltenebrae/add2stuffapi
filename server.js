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
    response.json({ info: 'API endpoint for add2stuff' });
});


getCategories = (request, response) => {
    pool.query('SELECT * FROM categories', (error, results) => {
        if (error || results == null) {
            console.log(error);
            return response.json([]);
        }
        return response.json(results.rows);
    })
}

updateCategory = (request, response) => {
    const id = parseInt(request.params.id);
    if (request.body && request.body.name) {
        pool.query('UPDATE categories SET name = $1 WHERE id = $2', [request.body.name, id], (error, results) => {
            if (error) {
                console.log(error);
                return response.json({status: -1, message: error});
            }
            return response.json({status: 1, message: 'Category updated successfully'});
        });
    }
    else {
        return response.json({status: -1, message: 'Missing body in request'});
    }
}

deleteCategory = (request, response) => {
    const id = parseInt(request.params.id);
    pool.query('DELETE FROM categories WHERE id = $1', [id], (error, results) => {
        if (error) {
            console.log(error);
            return response.json({status: -1, message: error});
        }
        return response.json({status: 1, message: 'Category deleted successfully'});
    });
}

createCategory = (request, response) => {
    if (request.body && request.body.name) {
        pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [request.body.name], (error, results) => {
            if (error) {
                console.log(error);
                return response.json({status: -1, message: error});
            }
            return response.json({status: 1, message: 'Category created successfully', id: results.rows[0].id});
        });
    }
    else {
        return response.json({status: -1, message: 'Missing body in request'});
    }
}

app.get('/api/categories', getCategories);
app.put('/api/categories/:id', updateCategory);
app.delete('/api/categories/:id', deleteCategory);
app.post('/api/categories', createCategory);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});