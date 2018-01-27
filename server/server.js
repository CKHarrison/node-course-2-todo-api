const _ = require('lodash');
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

// Delete route
app.delete('/todos/:id', (req, res) => {
    // Get the id
    let id = req.params.id;

    // Validate the id, not valid return 404
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // remove todo by id
    Todo.findByIdAndRemove(id).then((todo) => {
    // success
        // if no doc, send 404
        if(!todo) {
            return res.status(404).send();
        }
        // if doc, send doc back with 200
        res.send({todo});
        // error
        // send 400 with empty body
    }).catch((e) => {
        return res.status(400).send();
    });
});

// Patch route, we are using the patch instead of put, because we are only modifying a subset of properties, not the entire thing. 
app.patch('/todos/:id', (req, res) => {
    let id = req.params.id;
    // picking only the items that can be modified 
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    // Checking to see if the commpleted @ property exists as a boolean and is true set the new completed date
    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        // if completedAt is not a boolean or is not true, set it to false, and remove the completedAt property
        body.completed = false;
        body.completedAt = null;
    }
    // updating the todo in the database, by finding the id, setting the new body. if confused look at mongodb for $set and new methods
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});

app.listen(port, () => {
    console.log(`Started up at ${port}`);
});

module.exports = {app};