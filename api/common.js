module.exports = {
    /** sendJsonResponse function - sends a json response with optional status code and optional token
     * @param res - response object
     * @param success - true if request was successful, false if request was unsuccessful
     * @param message - details on what happened with the request
     * @param statusCode (optional) - HTTP status code to send in response
     * @param token (optional) - jwt token to authenticate user
     */
    sendJsonResponse: function (res, success, message, statusCode, token) {
        var data = {
            success: success,
            message: message
        }

        if(token) {
            data.token = token;
        }

        if(statusCode) {
            res.status(statusCode).json(data);
        }
        else {
            res.json(data);
        }
    },
    permissions: { "REGULAR": 1, "MANAGER": 2, "ADMIN": 3 }
}