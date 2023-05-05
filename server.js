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
            console.log(error != null? error: "gc query returned null.");
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

getCardsWithCategories = (request, response) => {
    pool.query('SELECT * FROM card_categories', (error, results) => {
        if (error || results == null) {
            console.log(error != null? error: " gcwc query returned null.");
            return response.json(null);
        }
        let cat_dict = {};
        for (let card of results.rows) {
            if (cat_dict[card.category] !== undefined) {
                cat_dict[card.category].push(card.name);
            }
            else {
                cat_dict[card.category] = [card.name];
            }
        }
        return response.json(cat_dict);
    });
}

getCategoriesForCard = (request, response) => {
    if (request.body && request.body.name) {
        pool.query('SELECT category FROM card_categories WHERE name = $1', [request.body.name], (error, results) => {
            if (error || results == null) {
                console.log(error != null? error: "gcfc query returned null.");
                return response.json([]);
            }
            return response.json(results.rows);
        });
    }
    else {
        return response.json([]);
    }
}

addCardToCategory = (request, response) => {
    if (request.body && request.body.name && request.body.category) {
        pool.query('SELECT * FROM card_categories WHERE name = $1 AND category = $2', [request.body.name, request.body.category], (error, results) => {
            if (error) {
                console.log(error);
                return response.json({status: -1, message: error});
            }
            if (results && results.rows && results.rows.length > 0) {
                return response.json({status: -1, message: 'Card is already included in that category'});
            }
            pool.query('INSERT INTO card_categories (name, category) VALUES ($1, $2)', [request.body.name, request.body.category], (er, re) => {
                if (er) {
                    console.log(er);
                    return response.json({status: -1, message: er});
                }
                return response.json({status: 1, message: 'Card added to category successfully'});
            });
        });
    }
    else {
        return response.json({status: -1, message: 'Missing body in request'});
    }
}

removeCardFromCategory = (request, response) => {
    if (request.body && request.body.name && request.body.category) {
        pool.query('DELETE FROM card_categories WHERE name = $1 AND category = $2', [request.body.name, request.body.category], (error, results) => {
            if (error) {
                console.log(error);
                return response.json({status: -1, message: error});
            }
            return response.json({status: 1, message: 'Card removed from category successfully'});
        })
    }
    else {
        return response.json({status: -1, message: 'Missing body in request'});
    }
}

getImageForCard = (request, response) => {
    if (request.body && request.body.name) {
        pool.query('SELECT * FROM card_images WHERE name = $1', [request.body.name], (error, results) => {
            if (error) {
                console.log(error);
                return response.json(null);
            }
            if (results.rows && results.rows.length > 0) {
                return response.json(results.rows[0]);
            }
            else {
                return response.json(null);
            }
        })
    }
    else {
        return response.json(null);
    }
}

setImageForCard = (request, response) => {
    if (request.body && request.body.name) {
        pool.query('SELECT * FROM card_images WHERE name = $1', [request.body.name], (error, results) => {
          if (error) {
              console.log(error);
              return response.json({status: -1, message: error});
          }
          else {
              if (results.rows && results.rows.length > 0) {
                  pool.query('UPDATE card_images SET image = $1, back_image = $2 WHERE name = $3',
                      [request.body.name, request.body.image, request.body.back_image], (er, re) => {
                          if (er) {
                              console.log(er);
                              return response.json({status: -1, message: er});
                          }
                          return response.json({status: 1, message: 'Card image updated successfully'});
                      });
              }
              else {
                  pool.query('INSERT INTO card_images (name, image, back_image) VALUES ($1, $2, $3) RETURNING *',
                      [request.body.name, request.body.image, request.body.back_image], (er, re) => {
                          if (er) {
                              console.log(er);
                              return response.json({status: -1, message: er});
                          }
                          return response.json({status: 1, message: 'Card image created successfully'});
                      });
              }
          }
        })
    }
    else {
        return response.json({status: -1, message: 'Missing body in request'});
    }
}

deleteCardImage = (request, response) => {
    if (request.body && request.body.name) {
        pool.query('DELETE FROM card_images WHERE name = $1', [request.body.name], (error, results) => {
            if (error) {
                console.log(error);
                return response.json({status: -1, message: error});
            }
            return response.json({status: 1, message: 'Card image deleted successfully'});
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