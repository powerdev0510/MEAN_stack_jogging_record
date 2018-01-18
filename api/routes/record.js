var express = require('express');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var validator = require('validator');
var sanitize = require('mongo-sanitize');
var jwt = require('jsonwebtoken');
var User = require('../model/user');
var Record = require('../model/record');
var isAuthenticated = require('../middleware/isAuthenticated');
var moment = require('moment');

var router = express.Router();

var config = require('../../config');
var common = require('../common');

var sendJsonResponse = common.sendJsonResponse;
var permissions = common.permissions;

var error = "";

/**
 * create record - Create a new time entry with date, distance in meters, and time in seconds.
 * Sends a response object with success true if record was created.
 * Sends a response object with success false if record couldn't be created.
 */
router.post('/create', isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;
    var record = req.body;

    record.user_id = record.user_id ? sanitize(record.user_id): loggedInUser._id;
    record.date = sanitize(record.date);
    record.distance = sanitize(record.distance);
    record.time = sanitize(record.time);
    record.location = sanitize(record.location);

    if(!validDate(record.date) || !validDistance(record.distance) || !validTime(record.time)) {
        sendJsonResponse(res, false, error, 400);
    }
    else if(!record.user_id || !mongoose.Types.ObjectId.isValid(record.user_id)) {
        sendJsonResponse(res, false, "Invalid user ID", 400);
    }
    else {
        record.date = new Date(record.date);
        User.findOne({_id: ObjectId(record.user_id)}, function(err, user) {
            if(loggedInUser._id != user._id && loggedInUser.permission_level != "ADMIN") {
                sendJsonResponse(res, false, "This action is forbidden.", 403);
            }
            else if(err) {
                sendJsonResponse(res, false, "There was an error processing your request", 400);
            }
            else {
                if(user) {
                    var rec = new Record({date: record.date, meters: record.distance, seconds: record.time, location:record.location, user: record.user_id});
                    rec.save(function (err) {
                        if (err) {
                            console.log(err);
                            sendJsonResponse(res, false, "There was an error processing your request.", 400);
                        }
                        else { //If everything is fine
                            sendJsonResponse(res, true, "Record added!");
                        }
                    });
                }
                else {
                    sendJsonResponse(res, false, "No user found with that user_id.", 404);
                }
            }
        });
    }

    error = "";
});

/**
 * Record get all function - Gets all records of the logged in user if no ID provided. If ID is provided and user is admin, it gets the records of the user who's ID was provided.
 * returns success true if data was retrieved successfully.
 * returns false if no records were retrieved
 */
router.get(['/get/all', '/get/user/:user_id'], isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;

    var user_id = req.params.user_id ? req.params.user_id : loggedInUser._id;

    if(mongoose.Types.ObjectId.isValid(user_id)) {
        User.findOne({_id: ObjectId(user_id)}, function(err, user) {
            if(err) {
                console.log(err);
                sendJsonResponse(res, false, "There was an error processing your request.", 400);
            }
            else if(user) {
                if(user._id == loggedInUser._id || loggedInUser.permission_level == "ADMIN") {
                    Record.find().where("user", user._id).sort("date").exec(function(err, records) {
                        if(err) {
                            sendJsonResponse(res, false, "There was an error processing your request.", 400);
                        }
                        else {
                            res.json({
                                success: true,
                                message: "Successfully retrieved records",
                                data: records
                            });
                        }
                    });
                }
                else {
                    sendJsonResponse(res, false, "This action is forbidden.", 403);
                }
            }
            else {
                sendJsonResponse(res, false, "No user found with that ID.", 404);
            }
        });
    }
    else {
        sendJsonResponse(res, false, "Invalid user ID.", 400);
    }
});

/**
 * Record get function - Gets record with specified record_id of user.
 * returns success true if data was retrieved successfully.
 * returns false if no records were retrieved
 */
router.get(['/get/:record_id', '/get/:record_id/:user_id/'], isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;
    var user_id = req.params.user_id ? sanitize(req.params.user_id) : loggedInUser._id;
    var record_id = sanitize(req.params.record_id);

    if(mongoose.Types.ObjectId.isValid(user_id) && mongoose.Types.ObjectId.isValid(record_id)) {
        if(user_id == loggedInUser._id || loggedInUser.permission_level == "ADMIN") {
            Record.findOne({_id: ObjectId(record_id)}, function(err, record) {
                if(err) {
                    console.log(err);
                    sendJsonResponse(res, false, "There was an error processing your request.", 400);
                }
                else if(record) {
                    if(record.user == user_id || loggedInUser.permission_level == "ADMIN") {
                        res.json({
                            success: true,
                            message: "Successfully retrieved record",
                            record: record
                        });
                    }
                    else {
                        sendJsonResponse(res, false, "This action is forbidden.", 403);
                    }
                }
                else {
                    sendJsonResponse(res, false, "No record found with provided ID.", 404);
                }
            });
        }
        else {
            sendJsonResponse(res, false, "This action is forbidden.", 403);
        }
    }
    else {
        sendJsonResponse(res, false, "Invalid user ID or record ID.", 400);
    }
});

/**
 * update record - update record with specified record_id
 * Sends a response object with success true if record was update.
 * Sends a response object with success false if record couldn't be updated.
 */
router.put('/update', isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;
    var record = req.body;

    record.record_id = sanitize(record.record_id);
    record.date = sanitize(record.date);
    record.distance = sanitize(record.distance);
    record.time = sanitize(record.time);
    record.location = sanitize(record.location);

    if((record.date && !validDate(record.date)) || (record.distance && !validDistance(record.distance)) || (record.time && !validTime(record.time))) {
        sendJsonResponse(res, false, error, 400);
    }
    else {
        Record.findOne({
            _id: record.record_id
        }, function (err, rec) {
            if(err) {
                sendJsonResponse(res, false, "There was an error processing your request.", 400);
            }
            else {
                if(rec) {
                    if(rec.user != loggedInUser._id && loggedInUser.permission_level != "ADMIN") {
                        sendJsonResponse(res, false, "This action is forbidden.", 403);
                    }
                    else {
                        if(record.date) {
                            rec.date = new Date(record.date);
                        }
                        if(record.distance) {
                            rec.meters = record.distance;
                        }
                        if(record.time) {
                            rec.seconds = record.time;
                        }
                        if(record.location) {
                            rec.location = record.location;
                        }
                        rec.save(function (err) {
                            if (err) {
                                console.log(err);
                                sendJsonResponse(res, false, "There was an error processing your request.", 400);
                            }
                            else { //If everything is fine
                                sendJsonResponse(res, true, "Record updated!");
                            }
                        });
                    }
                }
                else {
                    sendJsonResponse(res, false, "No record found with that ID.", 404);
                }
            }
        });
    }
});

/**
 * delete record - delete record with specified record_id
 * Sends a response object with success true if record was deleted.
 * Sends a response object with success false if record couldn't be deleted.
 */
router.delete('/delete/:record_id', isAuthenticated, function(req, res, next) {
    var loggedInUser = req.decoded;
    var record_id = sanitize(req.params.record_id);
    if(!mongoose.Types.ObjectId.isValid(record_id)) {
        sendJsonResponse(res, false, "Invalid record ID.", 400);
    }
    else {
        Record.findOne({
            _id: record_id
        }, function (err, rec) {
            if(err) {
                sendJsonResponse(res, false, "There was an error processing your request.", 400);
            }
            else {
                if(rec) {
                    User.findOne({_id: rec.user}, function(err, user) {
                        if(loggedInUser._id != user._id && loggedInUser.permission_level != "ADMIN") {
                            sendJsonResponse(res, false, "This action is forbidden.", 403);
                        }
                        else {
                            rec.remove().then(function() {
                                sendJsonResponse(res, true, "Successfully removed record.");
                            }, function() {
                                sendJsonResponse(res, false, "Unable to delete record.");
                            });
                        }
                    });
                }
                else {
                    sendJsonResponse(res, false, "No record found with that ID.", 404);
                }
            }
        });
    }
});

/**
 * function validDate
 * @param date - date address to check if it is valid
 * @returns {boolean} - true if date is valid
 */
function validDate(date) {
    if(date && (moment(date, 'YYYY/MM/DD', true).isValid() || moment(date, 'DD/MM/YYYY', true).isValid())) {
        return true;
    }
    else {
        error = "Invalid date entered. (Note: Valid date formats are YYYY/MM/DD and DD/MM/YYYY";
        return false;
    }
}

/**
 * function validDistance
 * @param distance (in meters)
 * @returns {boolean} true if valid distance in meters, false otherwise.
 */
function validDistance(distance) {
    if(distance && distance == parseInt(distance) && distance > 0 && distance < Number.MAX_SAFE_INTEGER) {
        return true;
    }
    else {
        error = "Invalid distance entered. Distance value must be between 1 and " + Number.MAX_SAFE_INTEGER + " meters.";
        return false;
    }
}

/**
 * function validTime
 * @param time (in seconds)
 * @returns {boolean} true if valid time in seconds, false otherwise.
 */
function validTime(time) {
    if(time && time == parseInt(time) && time > 0 && time < Number.MAX_SAFE_INTEGER) {
        return true;
    }
    else {
        error = "Invalid time entered. Time value must be between 1 and " + Number.MAX_SAFE_INTEGER + " seconds.";
        return false;
    }
}

module.exports = router;