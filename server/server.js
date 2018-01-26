const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;
// creating middleware
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

// Get /todos/:id
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    // validate id using isValid
        // if not valid stop respond with 404, send back empty send
        if(!ObjectID.isValid(id)) {
            return res.status(404).send();
        }
        Todo.findById(id).then((todo) => {
        // Success
            // if no todo - send back 404 with empty body
            if(!todo) {
                return res.status(404).send();
            }
            // if todo - send it back
            res.send({todo});
        }).catch((e) => {
            res.status(400).send();
        });
});

app.listen(port, () => {
    console.log(`Started up at ${port}`);
});

module.exports = {app};