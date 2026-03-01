const express = require('express');
const app = express();


const mustache = require('mustache-express');
const Model = require('./app.model.js');



app.engine('mustache', mustache());
app.set('view engine', 'mustache');

app.set('views', __dirname + '/views');




app.get('/',function (req,res){

    res.render('landing_page');

});

app.get('/login',function (req,res) {

    var data = {
        title: "Login Page",
        cardHeading : "Login",
        login: true,
        register: false
    }

    res.render('account',data);
});

app.get('/register',function (req,res) {
    var data = {
        title: "Register Page",
        cardHeading : "Register",
        login: false,
        register: true

    }
    res.render('account',data);
});
app.get("/background_landingPage.jpg", function (req,res){
    res.sendFile(__dirname + "/views/background_landingPage.jpg")
});
app.get('/script.js',function (req,res){
    res.sendFile(__dirname + '/script.js');
});
app.get('/output.css',function (req,res){

   res.sendFile(__dirname + '/views/output.css');
});
app.listen(3000, function () {
    console.log("Server is running on port 3000");
});