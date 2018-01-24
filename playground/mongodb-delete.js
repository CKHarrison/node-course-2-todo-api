// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('Unable to connect to MonogoDB Server');
    }
    console.log('Connected to MongoDB server');

    // deleteMany
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    // deleteOne
    // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    // findOneAndDelete
    // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    //     console.log(result);
    // });

    // Delete multiple users with the same name
    // db.collection('Users').deleteMany({name: 'Chris'}).then((result) => {
    //     console.log(result);
    // });

    //Delete specific document with userID
    db.collection('Users').deleteOne({
        _id: new ObjectID('5a67b0f0bf1373054cd3830b')
        }).then((result) => {
            console.log(result);
        });

    // db.close();
});