var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var Record = require('../model/record');

//User schema
var UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    permission_level: {
        type: String,
        enum: ['REGULAR', 'MANAGER', 'ADMIN'],
        required: true
    }
});

UserSchema.pre('remove', function(next) {
    Record.remove({user: this._id}).exec();
    next();
});

var User = mongoose.model('User', UserSchema);

module.exports = User;