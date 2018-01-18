var express = require('express');
var router = express.Router();
var url = 'http://localhost:4000'
var chai = require("chai");
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

var savedParam = {'admin_login_email': 'itoakio1@gmail.com', 'admin_login_password': 'asdfqwer1234qwer'};

//Create some sample users for testing
var user_email_1 = "test@gmail.com";
var user_password_1 = "password";

var user_email_2 = "hello@gmail.com";
var user_password_2 = "12345";

var user_email_3 = "email@gmail.com";
var user_password_3 = "pass123";

describe("JogTracker Unit Tests", function() {

    var user_token_1 = "";
    var user_id_1 = "";
    var user_token_2 = "";
    var user_id_2 = "";
    var user_token_3 = "";
    var user_id_3 = "";
    var admin_token = "";
    var admin_id = "";

    beforeEach(function(done) {
        chai.request(url)
            .post('/user/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email: savedParam['admin_login_email'], password: savedParam['admin_login_password']})
            .end(function(err, res) {
                admin_token = JSON.parse(res.text).token;
                done();
            });
    });
    beforeEach(function(done) {
        chai.request(url)
            .get('/user/get')
            .set('x-access-token', admin_token)
            .end(function(err, res) {
                chai.expect(res).to.have.status(200);
                admin_id = JSON.parse(res.text).user.id;
                done();
            });
    });
    beforeEach(function(done){
        chai.request(url)
            .post('/user/register')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email:user_email_1, password:user_password_1})
            .end(function(err, res) {
                user_token_1 = JSON.parse(res.text).token;
                done();
            });
    });
    beforeEach(function(done) {
        chai.request(url)
            .post('/user/register')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email:user_email_2, password:user_password_2})
            .end(function(err, res) {
                user_token_2 = JSON.parse(res.text).token;
                done();
            });
    });
    beforeEach(function(done) {
        chai.request(url)
            .post('/user/register')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({email:user_email_3, password:user_password_3})
            .end(function(err, res) {
                user_token_3 = JSON.parse(res.text).token;
                done();
            });
    });
    beforeEach(function(done) {
        chai.request(url)
            .get('/user/get')
            .set('x-access-token', user_token_1)
            .end(function(err, res) {
                chai.expect(res).to.have.status(200);
                user_id_1 = JSON.parse(res.text).user.id;
                done();
            });
    });
    beforeEach(function(done) {
        chai.request(url)
            .get('/user/get')
            .set('x-access-token', user_token_2)
            .end(function(err, res) {
                chai.expect(res).to.have.status(200);
                user_id_2 = JSON.parse(res.text).user.id;
                done();
            });
    });
    beforeEach(function(done) {
        chai.request(url)
            .get('/user/get')
            .set('x-access-token', user_token_3)
            .end(function(err, res) {
                chai.expect(res).to.have.status(200);
                user_id_3 = JSON.parse(res.text).user.id;
                done();
            });
    });
    afterEach(function(done) {
        if(user_id_1 != "") {
            chai.request(url)
                .delete('/user/delete/' + user_id_1)
                .set('x-access-token', admin_token)
                .set('content-type', 'application/x-www-form-urlencoded')
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    done();
                });
        }
        else {
            done();
        }
    });
    afterEach(function(done) {
        if(user_id_2 != "") {
            chai.request(url)
                .delete('/user/delete/' + user_id_2)
                .set('x-access-token', admin_token)
                .set('content-type', 'application/x-www-form-urlencoded')
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    done();
                });
        }
        else {
            done();
        }
    });
    afterEach(function(done) {
        if(user_id_3 != "") {
            chai.request(url)
                .delete('/user/delete/' + user_id_3)
                .set('x-access-token', admin_token)
                .set('content-type', 'application/x-www-form-urlencoded')
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    done();
                });
        }
        else {
            done();
        }
    });

    describe("User Login Tests", function(done) {
        it('Login User - Valid Email, Valid Password', function(done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: user_email_1, password: user_password_1})
                .end(function (err, res) {
                    chai.expect(res).to.have.status(200);
                    chai.expect(JSON.parse(res.text).token).to.not.be.null;
                    done();
                });
        });

        it('Login User - Invalid Email', function(done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: "sd", password: user_password_1})
                .end(function (err, res) {
                    chai.expect(res).to.have.status(400);
                    done();
                });
        });

        it('Login User - Non-existing Email', function(done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: "afafhsajhfjs@gmail.com", password: user_password_1})
                .end(function (err, res) {
                    chai.expect(res).to.have.status(401);
                    done();
                });
        });

        it('Login User - No Email', function(done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({password: user_password_1})
                .end(function (err, res) {
                    chai.expect(res).to.have.status(400);
                    done();
                });
        });

        it('Login User - No Password', function(done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: user_email_1})
                .end(function (err, res) {
                    chai.expect(res).to.have.status(400);
                    done();
                });
        });

        it('Login User - Invalid Password', function(done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: user_email_1, password: "11111"})
                .end(function (err, res) {
                    chai.expect(res).to.have.status(401);
                    done();
                });
        });
    });

    describe("User Registration Tests", function (done) {
        var user_token = "";
        it('Register User Test - Valid User', function(done) {
            chai.request(url)
                .post('/user/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email:"newemail@gmail.com", password:"testpassword"})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    chai.expect(JSON.parse(res.text).token).to.not.be.null;
                    user_token = JSON.parse(res.text).token;
                    done();
                });
        });

        it('Register User Test - User already exists', function(done) {
            chai.request(url)
                .post('/user/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email:user_email_1, password:user_password_1})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(409);
                    done();
                });
        });

        it('Register User Test - No e-mail address', function(done) {
            chai.request(url)
                .post('/user/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email:"", password:user_password_1})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(400);
                    done();
                });
        });

        it('Register User Test - Invalid e-mail address', function(done) {
            chai.request(url)
                .post('/user/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email:"1@.com", password:user_password_1})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(400);
                    done();
                });
        });

        it('Register User Test - No password', function(done) {
            chai.request(url)
                .post('/user/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email:"test1@gmail.com", password:""})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(400);
                    done();
                });
        });

        it('Register User Test - Password too long', function(done) {
            chai.request(url)
                .post('/user/register')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email:"test2@gmail.com", password:"123456789012345678901"})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(400);
                    done();
                });
        });

        it('Delete User Test - Delete existing user as user', function(done) {
            chai.request(url)
                .delete('/user/delete')
                .set('x-access-token', user_token)
                .set('content-type', 'application/x-www-form-urlencoded')
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe("User Update Tests", function(done) {
        describe('Regular User Updates', function(done) {
            it('User updates his e-mail with no ID provided', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({newEmail:"test2@gmail.com", password:user_password_1})
                    .end(function(err, res) {
                        user_token_1 = JSON.parse(res.text).token;
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('User updates his e-mail with ID provided', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: user_id_1, newEmail:"test3@gmail.com", password:user_password_1})
                    .end(function(err, res) {
                        user_token_1 = JSON.parse(res.text).token;
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('User updates his e-mail with invalid e-mail', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({newEmail:"2@com", password:user_password_1})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('User updates his e-mail with already existing e-mail', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({newEmail:user_email_2, password:user_password_2})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(409);
                        done();
                    });
            });

            it('User updates his password with invalid password', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({newEmail:"test2@gmail.com", password:"12345123214124142141242145151252"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('User updates his password with valid password', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({password:"password"})
                    .end(function(err, res) {
                        user_token_1 = JSON.parse(res.text).token;
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('User tries to update with invalid ID', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: 123, newEmail: "test5@gmail.com", password:"password"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('User tries to update with another users ID', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: user_id_2, newEmail: "test5@gmail.com", password:"password"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('User tries to update his permission level', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({permission_level: "ADMIN"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('User tries to update someone elses permission level', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: user_id_2, permission_level: "ADMIN"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });
        });
        describe('Manager User Updates', function(done) {
            beforeEach(function(done){
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_1, permission_level: "MANAGER"})
                    .end(function(err, res) {
                        done();
                    });
            });
            beforeEach(function(done){
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_3, permission_level: "MANAGER"})
                    .end(function(err, res) {
                        done();
                    });
            });
            beforeEach(function(done){
                chai.request(url)
                    .post('/user/login')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({email: user_email_1, password: user_password_1})
                    .end(function(err, res) {
                        user_token_1 = JSON.parse(res.text).token;
                        done();
                    });
            });

            it('Manager updates his e-mail with no ID provided', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({newEmail:"manager2@gmail.com", password:user_password_1})
                    .end(function(err, res) {
                        user_token_1 = JSON.parse(res.text).token;
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Manager updates user e-mail with ID provided', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: user_id_2, newEmail:"useremail2@gmail.com", password:user_password_2})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Manager updates tries to update users permission level', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: user_id_2, permission_level: "MANAGER"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('Manager updates tries to update another managers permission level', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: user_id_3, permission_level: "REGULAR"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('Manager updates tries to update admin permission level', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: admin_id, permission_level: "REGULAR"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('Manager tries to update another managers information', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .send({id: user_id_3, newEmail:"qwe@gmail.com", password:"hello123"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });
        });
        describe('Admin User Updates', function(done) {
            beforeEach(function (done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_1, permission_level: "MANAGER"})
                    .end(function (err, res) {
                        done();
                    });
            });
            beforeEach(function (done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_2, permission_level: "ADMIN"})
                    .end(function (err, res) {
                        done();
                    });
            });
            beforeEach(function (done) {
                chai.request(url)
                    .post('/user/login')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({email: user_email_2, password: user_password_2})
                    .end(function (err, res) {
                        user_token_2 = JSON.parse(res.text).token;
                        done();
                    });
            });

            it('Admin updates his e-mail with no ID provided', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_2)
                    .send({newEmail:"i_am_admin@gmail.com"})
                    .end(function(err, res) {
                        user_token_2 = JSON.parse(res.text).token;
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin updates user e-mail with ID provided', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_3, newEmail:"useremail3@gmail.com"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin updates user e-mail with ID provided with email that already exists', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_3, newEmail: user_email_2})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(409);
                        done();
                    });
            });

            it('Admin updates manager e-mail with ID provided', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_1, newEmail:"useremail4@gmail.com"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin updates manager password with ID provided password too short', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_1, password:"1"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Admin updates manager password with ID valid password', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_1, password:"12345"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin updates tries to update users permission level', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_1, permission_level: "REGULAR"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin updates tries to update another admin permission level', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_2, permission_level: "REGULAR"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin updates another admin information', function(done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_2, newEmail:"qwe@gmail.com", password:"hello123"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });
        });
    });

    describe("User Get All Tests", function(done) {
        beforeEach(function (done) {
            chai.request(url)
                .put('/user/update')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('x-access-token', admin_token)
                .send({id: user_id_2, permission_level: "MANAGER"})
                .end(function (err, res) {
                    done();
                });
        });
        beforeEach(function (done) {
            chai.request(url)
                .put('/user/update')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('x-access-token', admin_token)
                .send({id: user_id_3, permission_level: "ADMIN"})
                .end(function (err, res) {
                    done();
                });
        });
        beforeEach(function (done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: user_email_2, password: user_password_2})
                .end(function (err, res) {
                    user_token_2 = JSON.parse(res.text).token;
                    done();
                });
        });
        beforeEach(function (done) {
            chai.request(url)
                .post('/user/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({email: user_email_3, password: user_password_3})
                .end(function (err, res) {
                    user_token_3 = JSON.parse(res.text).token;
                    done();
                });
        });
        it('User tries get list of users', function(done) {
            chai.request(url)
                .get('/user/all')
                .set('x-access-token', user_token_1)
                .send()
                .end(function(err, res) {
                    chai.expect(res).to.have.status(403);
                    done();
                });
        });
        it('Manager tries to get list of users', function(done) {
            chai.request(url)
                .get('/user/all')
                .set('x-access-token', user_token_2)
                .send()
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    for(var i = 0; i < JSON.parse(res.text).users.length; i++) {
                        chai.expect(JSON.parse(res.text).users[i].permission_level).to.equal('REGULAR');
                    }
                    done();
                });
        });
        it('Admin tries to get list of users', function(done) {
            chai.request(url)
                .get('/user/all')
                .set('x-access-token', admin_token)
                .send()
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    var permission_levels = [];
                    for(var i = 0; i < JSON.parse(res.text).users.length; i++) {
                        permission_levels.push(JSON.parse(res.text).users[i].permission_level);
                    }
                    chai.expect(permission_levels).to.include.members(['REGULAR', 'MANAGER', 'ADMIN']);
                    done();
                });
        });
    });

    describe("User Delete Tests", function(done) {
        describe('Regular User Delete', function(done) {
            var manager_token = "";
            var manager_id = "";
            beforeEach(function(done){
                chai.request(url)
                    .post('/user/register')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({email:"manager@gmail.com", password:user_password_1})
                    .end(function(err, res) {
                        manager_token = JSON.parse(res.text).token;
                        done();
                    });
            });
            beforeEach(function(done) {
                chai.request(url)
                    .get('/user/get')
                    .set('x-access-token', manager_token)
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        manager_id = JSON.parse(res.text).user.id;
                        done();
                    });
            });
            beforeEach(function (done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: manager_id, permission_level: "MANAGER"})
                    .end(function (err, res) {
                        done();
                    });
            });

            beforeEach(function (done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_2, permission_level: "MANAGER"})
                    .end(function (err, res) {
                        done();
                    });
            });
            beforeEach(function (done) {
                chai.request(url)
                    .put('/user/update')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .send({id: user_id_3, permission_level: "ADMIN"})
                    .end(function (err, res) {
                        done();
                    });
            });
            beforeEach(function (done) {
                chai.request(url)
                    .post('/user/login')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({email: user_email_2, password: user_password_2})
                    .end(function (err, res) {
                        user_token_2 = JSON.parse(res.text).token;
                        done();
                    });
            });
            beforeEach(function (done) {
                chai.request(url)
                    .post('/user/login')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({email: user_email_3, password: user_password_3})
                    .end(function (err, res) {
                        user_token_3 = JSON.parse(res.text).token;
                        done();
                    });
            });

            afterEach(function (done) {
                if(manager_id != "") {
                    chai.request(url)
                        .delete('/user/delete/' + manager_id)
                        .set('content-type', 'application/x-www-form-urlencoded')
                        .set('x-access-token', admin_token)
                        .end(function (err, res) {
                            done();
                        });
                }
                else {
                    done();
                }
            });
            it('Regular user tries to delete another user with users ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + user_id_2)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('Regular user tries to delete another himself with ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + user_id_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .end(function(err, res) {
                        user_id_1 = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Regular user tries to delete himself without ID', function(done) {
                chai.request(url)
                    .delete('/user/delete')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_1)
                    .end(function(err, res) {
                        user_id_1 = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Manager tries to delete user with ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + user_id_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_2)
                    .end(function(err, res) {
                        user_id_1 = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Manager tries to delete manager with ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + manager_id)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_2)
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('Manager tries to delete admin with ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + admin_id)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_2)
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('Manager tries to delete himself without ID', function(done) {
                chai.request(url)
                    .delete('/user/delete')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_2)
                    .end(function(err, res) {
                        user_id_2 = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin tries to delete user with ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + user_id_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .end(function(err, res) {
                        user_id_1 = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin tries to delete manager with ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + manager_id)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .end(function(err, res) {
                        manager_id = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin tries to delete admin with ID', function(done) {
                chai.request(url)
                    .delete('/user/delete/' + user_id_3)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', admin_token)
                    .end(function(err, res) {
                        user_id_3 = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Admin tries to delete himself without ID', function(done) {
                chai.request(url)
                    .delete('/user/delete')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('x-access-token', user_token_3)
                    .end(function(err, res) {
                        user_id_3 = "";
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });
        });
    });

    describe("Record Create Tests", function(done) {
        beforeEach(function(done) {
            chai.request(url)
                .post('/record/create')
                .set('x-access-token', user_token_1)
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({user_id: user_id_1, date:"01/01/2017", time:"10", distance:"5", location:"hong kong"})
                .end(function(err, res) {
                    console.log(err);
                    chai.expect(res).to.have.status(200);
                    done();
                });
        });

        beforeEach(function(done) {
            chai.request(url)
                .post('/record/create')
                .set('x-access-token', user_token_2)
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({user_id: user_id_2, date:"01/01/2017", time:"10", distance:"5", location:"new york"})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    done();
                });
        });

        beforeEach(function(done) {
            chai.request(url)
                .post('/record/create')
                .set('x-access-token', user_token_3)
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({user_id: user_id_3, date:"01/01/2017", time:"10", distance:"5", location:"tokyo"})
                .end(function(err, res) {
                    chai.expect(res).to.have.status(200);
                    done();
                });
        });
        describe('Regular Create Test', function(done) {

            it('Record Create - Valid User - Valid Record', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01/01/2017", time:"10", distance:"5", location:"beijing"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });

            it('Record Create - Valid User - Invalid Record - Invalid date', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01012012", time:"10", distance:"5", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Record Create - Valid User - Invalid Record - negative time', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01/01/2017", time:"-1", distance:"5", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Record Create - Valid User - Invalid Record - time too large', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01/01/2017", time:"999999999999999999999", distance:"5", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Record Create - Valid User - Invalid Record - non-integer time', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01/01/2017", time:"5.5", distance:"5", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Record Create - Valid User - Invalid Record - negative distance', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01/01/2017", time:"1", distance:"-1", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Record Create - Valid User - Invalid Record - distance too large', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01/01/2017", time:"5", distance:"999999999999999999999", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Record Create - Valid User - Invalid Record - non-integer distance', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_1, date:"01/01/2017", time:"5", distance:"5.5", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(400);
                        done();
                    });
            });

            it('Record Create - Valid Record - Another person user ID', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', user_token_1)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_2, date:"01/01/2017", time:"10", distance:"5", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(403);
                        done();
                    });
            });

            it('Record Create - Valid Record - Admin creates record for another user', function(done) {
                chai.request(url)
                    .post('/record/create')
                    .set('x-access-token', admin_token)
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({user_id: user_id_2, date:"01/01/2017", time:"10", distance:"5", location:"hong kong"})
                    .end(function(err, res) {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });
        });

        describe('Record Get Test', function(done) {

        });
    });

});
