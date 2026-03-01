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
app.get("/background_landingPage.jpg", function (req,res){
    console.log("Background image requested");
    res.sendFile(__dirname + "/views/background_landingPage.jpg")
});
app.get('/output.css',function (req,res){
    console.log("Background image requested1");

   res.sendFile(__dirname + '/views/output.css');
});
app.listen(3000, function () {
    console.log("Server is running on port 3000");
});