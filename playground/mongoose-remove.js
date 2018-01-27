const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Delete multiple records - Todo.remove({})
// Todo.remove({}).then((result) => {
//     console.log(result);
// });

// Delete one record 
// Todo.findOneAndRemove - returns the doc back
Todo.findOneAndRemove({ _id: '5a6beecfa4a8d60ae24de2d6'}).then((result) => {

});
// Todo.findByIdAndRemove - returns the doc

Todo.findByIdAndRemove('5a6beecfa4a8d60ae24de2d6').then((todo) => {
    console.log(todo);
});