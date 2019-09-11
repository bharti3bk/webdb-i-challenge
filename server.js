const express = require('express');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

module.exports = server;

server.get('/', (req, res) => {
    res.send('<h3>DB Helpers with knex</h3>');
});

// get accounts
server.get('/api/accounts', (req, res) => {
    db('accounts')
        .select('*')
        .then(accounts => {
            res.status(200).json(accounts);
        })
        .catch(err => {
            res.json(err);
        });
});

// get specific account 
server.get('/api/accounts/:id', validateId, (req, res) => {
    const { id } = req.params; 
    db("accounts")
    .where({ id })
    .first()
    .then(account => {
      if (!account) {
        res.status(400)
          .json({ error: `Account with the ID ${id} could not be found` });
      } else {
        res.status(200).json(account);
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });  
});

// Add an account 

server.post('/api/accounts/:id', validateId, (req, res) => {
    const UserData = req.body;
    db("accounts")
      .insert(UserData, "id")
      .then(([id]) => {
        db("accounts")
          .where({ id }) // always return an array 
          .first() // it will pick the first element of the resulting array 
          .then(account => {
            res.status(200).json(account);
          })
          .catch(err => {
            res.status(500).json(err);
          });
      })
      .catch(err => {
        res.status(500).json(err);
      });
});

// Delete an Account 

server.delete('/api/accounts/:id', validateId, (req, res) => {
    db('accounts')
        .where({ id: req.params.id })
        .del()
        .then(count => {
            res.status(200).json({ message: `deleted ${count} records` });
        })
        .catch(err => {
            res.json(err);
        });
});

// Update an account 

server.put('/api/accounts/:id', validateId, (req, res) => {
    const { name, budget } = req.body;

    if (!name || typeof budget !== 'number') {
        return res.status(400).json({
            error: 'Needs name and budget. Budget must have a number value.'
        });
    }
    db('accounts')
        .where('id', req.params.id)
        .update({ name, budget })
        .then(account => {
            res.status(200).json(account);
        })
        .catch(err => {
            res.json(err);
        });
});


// MiddleWares 

function validateId(req, res, next) {
    const { id } = req.params;
    db('accounts')
        .where({ id })
        .first()
        .then(account => {
            if (account) {
                req.account = account;
                next();
            } else {
                res.status(404).json({ error: 'There is no account with the specified id' });
            }
        });
}


