const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        minlength: 1,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    },
        {
            usePushEach: true

        }]
});

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
    
    // This is different than the video due to the latest updates to mongoose. Found the answers to this problem at https://www.udemy.com/the-complete-nodejs-developer-course-2/learn/v4/questions/3282680
    user.tokens = user.tokens.concat([{ access, token }]);
    return user.save().then (() => {
        return token;
    })
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};