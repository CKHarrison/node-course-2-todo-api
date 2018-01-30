require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');


var app = express();
const port = process.env.PORT;
// creating middleware
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos',authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

// Get /todos/:id
app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    // validate id using isValid
        // if not valid stop respond with 404, send back empty send
        if(!ObjectID.isValid(id)) {
            return res.status(404).send();
        }
        Todo.findOne({
            _id: id,
            _creator: req.user._id
        }).then((todo) => {
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
app.delete('/todos/:id', authenticate, (req, res) => {
    // Get the id
    let id = req.params.id;

    // Validate the id, not valid return 404
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // remove todo by id
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
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
app.patch('/todos/:id', authenticate, (req, res) => {
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
    // findOneAndUpdate
    Todo.findOneAndUpdate({_id: id,_creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
        if(!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});

// POST /users
app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);  
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// route for logging in users, {email, password}
app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password).then((user) => {
       return user.generateAuthToken().then((token) => {
           res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

// route for logging out users
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up at ${port}`);
});

module.exports = {app};