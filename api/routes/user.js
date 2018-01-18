var express = require('express');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var validator = require('validator');
var sanitize = require('mongo-sanitize');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../model/user');
var isAuthenticated = require('../middleware/isAuthenticated');

var config = require('../../config');
var common = require('../common');

var sendJsonResponse = common.sendJsonResponse;
var permissions = common.permissions;

var router = express.Router();

var error = "";

/**
 * User Registration
 * Sends a response object with success true if user was registered.
 * Sends a response object with success false if user couldn't be registered.
 */
router.post('/register', function(req, res, next) {
    var userInfo = req.body;

    userInfo.email = sanitize(userInfo.email);
    userInfo.password = sanitize(userInfo.password);

    if(!validEmail(userInfo.email) || !validPassword(userInfo.password)) { //If the request info is invalid
        sendJsonResponse(res, false, error, 400);
    }
    else {
        //Check if e-mail already exists
        User.find({email: userInfo.email}, function(err, docs) {
            if(err) {
                console.log(err);
                sendJsonResponse(res, false, "There was an error processing your request.", 400);
            }
            else if(docs.length > 0) { //If e-mail was found in database, generate error
                sendJsonResponse(res, false, "This e-mail already exists, please login or use another e-mail.", 409);
            }
            else {
                //Create user based on data submitted.
                var user = new User({email: sanitize(userInfo.email), password: bcrypt.hashSync(sanitize(userInfo.password), 10), permission_level: 'REGULAR'});

                //Save it in the database.
                user.save(function (err) {
                    if (err) {
                        sendJsonResponse(res, false, "There was an error processing your request.", 400);
                    }
                    else { //If everything is fine

                        //Create token to login the registered user
                        var token = jwt.sign(user, config.secret, {
                            expiresIn: '24h' // expires in 24 hours
                        });

                        sendJsonResponse(res, true, "You have been registered!", 200, token);
                    }
                });
            }
        });
    }
    error = "";
});

/**
 * Get logged in user info
 * Returns success true and user's email and ID if found
 * Returns success false if there was an error.
 */
router.get('/get', isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;

    User.findOne({_id: loggedInUser._id}, function(err, user) {
        if(err) {
            sendJsonResponse(res, false, "There was an error processing your request.", 400);
        }
        else {
            res.json({
                success: true,
                message: "Successfully retrieved user.",
                user: {id: user._id, email: user.email, permission_level: user.permission_level}
            });
        }
    });
});

/**
 * Get user info
 * Returns success true and user's email and ID if found
 * Returns success false if there was an error.
 */
router.get('/get/:id', isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;

    var id = sanitize(req.params.id);

    if(loggedInUser.permission_level != "MANAGER" && loggedInUser.permission_level != "ADMIN") {
        sendJsonResponse(res, false, "This action is forbidden.", 403);
    }
    else {
        if(id && mongoose.Types.ObjectId.isValid(id)) {
            User.findOne({_id: id}, function(err, user) {
                if(user){
                    res.json({
                        success: true,
                        message: "Successfully retrieved user.",
                        user: {id: user._id, email: user.email, permission_level: user.permission_level}
                    });
                }
                else {
                    sendJsonResponse(res, false, "There was an error processing your request.", 400);
                }
            });
        }
        else {
            sendJsonResponse(res, false, "Invalid ID.", 400);
        }
    }
});

/**
 * Get all users
 * Sends a response object with success true and the list of users and their permission levels if the user is above regular level.
 * Sends a response object with false if user is a regular user.
 */
router.get('/all', isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;

    if(loggedInUser.permission_level == "REGULAR") {
        sendJsonResponse(res, false, "This action is forbidden.", 403);
    }
    else {
        var perm = (loggedInUser.permission_level == "ADMIN" ? {} : {permission_level: "REGULAR"});
        User.find(perm , {email: 1, permission_level: 1}, function(err, docs) {
            if(err) {
                sendJsonResponse(res, false, "There was an error processing your request.", 400);
            }
            else {
                res.json({
                    success: true,
                    message: "Successfully retrieved list of users.",
                    users: docs
                });
            }
        });
    }
});

/**
 * User Update
 * Sends a response object with success true if user was updated.
 * Sends a response object with success false if user couldn't be updated.
 */
router.put('/update', isAuthenticated, function(req, res, next) {
    var userInfo = req.body;

    var loggedInUser = req.decoded;

    userInfo._id = userInfo.id ? sanitize(userInfo.id) : loggedInUser._id;
    userInfo.newEmail = sanitize(userInfo.newEmail);
    userInfo.password = sanitize(userInfo.password);
    userInfo.permission_level = sanitize(userInfo.permission_level);

    if(!userInfo.newEmail && !userInfo.password && !userInfo.permission_level) {
        sendJsonResponse(res, false, "No valid data provided.", 400);
    }
    else if ((userInfo._id != loggedInUser._id && loggedInUser.permission_level == "REGULAR") || (userInfo.permission_level && loggedInUser.permission_level != "ADMIN")){
        sendJsonResponse(res, false, "This action is forbidden.", 403);
    }
    else if((userInfo.password && !validPassword(userInfo.password)) || (userInfo.newEmail && !validEmail(userInfo.newEmail)) || (userInfo.permission_level && !validPermission(userInfo.permission_level))) {
        sendJsonResponse(res, false, error, 400);
    }
    else {
        if(mongoose.Types.ObjectId.isValid(userInfo._id)) {
            User.findOne({
                _id: ObjectId(userInfo._id)
            }, function(err, user) {
                if(err) {
                    sendJsonResponse(res, false, "There was an error processing your request.", 400);
                }
                else if(user){
                    if(user._id != loggedInUser._id && loggedInUser.permission_level == "MANAGER" && (user.permission_level == "MANAGER" || user.permission_level == "ADMIN")) {
                        sendJsonResponse(res, false, "This action is forbidden.", 403);
                    }
                    else if(userInfo.newEmail) {
                        User.findOne({
                            email: userInfo.newEmail
                        }, function(err, doc) {
                            if(doc && doc.email != user.email) {
                                sendJsonResponse(res, false, "E-mail already exists.", 409);
                            }
                            else {
                                updateUser(res, user, userInfo, loggedInUser);
                            }
                        });
                    }
                    else {
                        updateUser(res, user, userInfo, loggedInUser);
                    }
                }
                else {
                    sendJsonResponse(res, false, "No user found.", 404);
                }
            });
        }
        else {
            sendJsonResponse(res, false, "Invalid user ID provided.", 400);
        }
    }
    error = "";
});

/**
 * User delete (User can only delete his own account. User managers and admins can delete any user account)
 * Sends a response object with success true and login token if user was deleted.
 * Sends a response object with success false if user couldn't be deleted.
 */
router.delete(['/delete', '/delete/:user_id'], isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;

    var userInfo = [];

    userInfo.id = req.params.user_id ? sanitize(req.params.user_id) : loggedInUser._id;

    if((loggedInUser.permission_level == "REGULAR" && loggedInUser._id != userInfo.id)) {
        sendJsonResponse(res, false, "This action is forbidden.", 403);
    }
    else {
        //Delete the user specified
        if(mongoose.Types.ObjectId.isValid(userInfo.id))
        {
            User.findOne({
                _id: ObjectId(userInfo.id)
            }, function (err, doc) {
                if(doc) {
                    if((loggedInUser._id != doc._id) && (loggedInUser.permission_level == "MANAGER" && (doc.permission_level == "MANAGER" || doc.permission_level == "ADMIN"))) {
                        sendJsonResponse(res, false, "This action is forbidden.", 403);
                    }
                    else {
                        doc.remove().then(function() {
                            sendJsonResponse(res, true, "Successfully deleted user.");
                        }, function(err) {
                            console.log(err);
                            sendJsonResponse(res, false, "There was an error removing the user.", 400);
                        });
                    }
                }
                else {
                    sendJsonResponse(res, false, "No user exists with the provided e-mail", 400);
                }
            });
        }
        else {
            sendJsonResponse(res, false, "Invalid user ID.", 400);
        }
    }
});

/**
 * User Login
 * Sends a response object with success true and login token if user was logged in.
 * Sends a response object with success false if user couldn't be logged in.
 */
router.post('/login', function(req, res, next) {
    var userInfo = req.body;
    userInfo.email = sanitize(userInfo.email);
    userInfo.password = sanitize(userInfo.password);

    if( !validEmail(userInfo.email)) { //Sanity check to see if e-mail is valid
        sendJsonResponse(res, false, error, 400);
    }
    else if(!validPassword(userInfo.password)) {
        sendJsonResponse(res, false, error, 400);
    }
    else {
        User.find({email: userInfo.email}, function(err, docs) { //Check if user e-mail exists
            if(err) {
                console.log(err);
                sendJsonResponse(res, false, "There was an error processing your request.", 400);
            }
            else if(docs.length == 0) {
                sendJsonResponse(res, false, "No registered user with that e-mail address.", 401);
            }
            else {
                if(bcrypt.compareSync(userInfo.password, docs[0].password)) { //If the password matches/is valid
                    var user = docs[0];
                    // create a jwt token for user
                    var token = jwt.sign(user, config.secret, {
                        expiresIn: '24h' // expires in 24 hours
                    });

                    sendJsonResponse(res, true, "Login successful!", 200, token);
                }
                else {
                    sendJsonResponse(res, false, "Invalid password. Please try again.", 401);
                }
            }
        });
    }
    error = "";
});

/**
 * validToken function - Just a simple function to test if a user token is valid for login purposes
 * Sends a response success true if it manages to pass through the isAuthenticated middleware
 */
router.get('/validToken', isAuthenticated, function(req, res, next) {
    res.json({
        success: true,
        message: "Valid token found."
    });
});

/**
 * function validEmail
 * @param email - email address to check if it is valid
 * @returns {boolean} - true if e-mail is valid
 */
function validEmail(email) {
    if(email != undefined && validator.isEmail(email)) {
        return true;
    }
    else {
        error = "Invalid e-mail address.";
        return false;
    }
}

/**
 * function validPassword
 * @param password - password to validate
 * @returns {boolean} - true if passwords are valid, false otherwise
 */
function validPassword(password) {
    if(password == undefined || !password || password.length < 5 || password.length > 20) {
        error = "Invalid password.";
        return false;
    }

    return true;
}

/**
 * function validPermission
 * @param permission_level - permission_level to validate
 * @returns {boolean} - true if permission_level is valid, false otherwise
 */
function validPermission(permission_level) {
    if(!permission_level || permissions[permission_level] == undefined) {
        error = "Invalid permission level.";
        return false;
    }

    return true;
}


/**
 * function updateUser
 * @param res - response object to send
 * @param user - user doc to be updated
 * @param userInfo - user information to update user with
 * @param loggedInUser - the logged in user
 */
function updateUser(res, user, userInfo, loggedInUser) {
    user.email = userInfo.newEmail ? userInfo.newEmail : user.email;
    if(userInfo.password) {
        user.password = bcrypt.hashSync(userInfo.password);
    }
    if(userInfo.permission_level && loggedInUser.permission_level == "ADMIN") {
        user.permission_level = userInfo.permission_level;
    }
    user.save().then(function() {
        //create new token to send user if user updated himself
        if(userInfo._id == loggedInUser._id) {
            var token = jwt.sign(user, config.secret, {
                expiresIn: '24h' // expires in 24 hours
            });
            sendJsonResponse(res, true, "Successfully updated user.", 200, token);
        }
        else { //otherwise just update the user data, no token
            sendJsonResponse(res, true, "Successfully updated user.");
        }
    }, function(err) {
        console.log(err);
        sendJsonResponse(res, false, "There was an error processing your request.", 400);
    });
}

module.exports = router;