const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: "First test todo"
}, {
    _id: new ObjectID(),
    text: "Second test todo",
    completed: true,
    completedAt: 333
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
       return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('Should not create todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        });
    });

    describe('GET /todos', () => {
        it('Should get all todos', (done) => {
            request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
        });
    });
});

describe('GET /todos/:id', () => {
    it('Should return todo doc', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done); 
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();

        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
 

    it('Should return 404 for non-object ids', (done) => {
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('Should remove a todo', (done) => {
        let hexId = todos[1]._id.toHexString();

        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            // Expecting to find that the todo does not exist when deleted
            // Querying the database to make sure the todo does not exist
            Todo.findById(hexId).then((todo) => {
                expect(todo).toNotExist();
                done();
            }).catch((e) => done(e));
        })
    });
    it('Should return 404 if todo not found', (done) => {
        let hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
    it('Should return 404 if object id is invalid', (done) => {
    request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });

    describe('PATCH /todo/:id', () => {
        it('Should update the todo', (done) => {
            // find id of first todo item
            let hexId = todos[0]._id.toHexString();
            let text = "Patch testing";
            // send the patch request with the id and update text and set completed to true
            request(app)
            .patch(`/todos/${hexId}`)
            .send({text, completed: true})
            // expect status code of 200
            .expect(200)
            // verify text property is equal to new text, completed is true, and completed at is a number (toBeA)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
        });
        it('Should clear completedAt when todo is not completed', (done) => {
            // find id of second todo item
            let hexId = todos[1]._id.toHexString();
            let text = "Some different text from testing";
            request(app)
            .patch(`/todos/${hexId}`)
            // Updated text and set completed to false
            .send({text, completed: false})
            // expect status code of 200
            .expect(200)
            // verify the response body reflects new changes
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
        });
    });
});