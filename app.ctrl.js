const express = require('express');
const app = express();



const mustache = require('mustache-express');
const Model = require('./app.model');



app.engine('mustache', mustache());
app.set('view engine', 'mustache');

app.set('views', __dirname + '/views');



Model.dataBaseConnection();
app.get('/',function (req,res){

    res.render('landing_page');

});
app.get('/view/:id',function (req,res) {

})
app.get('/home',async function (req, res) {

    let tableData = await Model.getAllIssues();
    let data = {
        title1: "Home Page",
        tableData: []

    }
    tableData.forEach(function (r) {
        console.log(r);
        data.tableData.push(r);
    })
    console.log(data);
    res.render('home', data);

    // (tableData => {
    //     console.log([r]);
    //     let data = {
    //         title: "Home Page",
    //         tableData: r
    //     }
    //     res.render('home', {data});
    // });


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

app.get('/loginUser',async  function (req,res) {

    let result = await Model.getLogin(req.query);
    result.forEach(function (row) {
        let count = row['Count(*)'];
        console.log(count);
        if(count === 0)
        {
            var data = {
                title: "Login Page",
                cardHeading : "Login",
                login: true,
                register: false,
                errorLogin: true,
                emailData: req.query.userEmailAddress
            }

            res.render('account',data);
        }
        else
        {
            res.redirect('home');
        }
    })

});
app.get('/submitIssue', async  function (req,res) {
    let issueData = req.query;
    console.log(req.query);
    await Model.insertIssue(issueData).then(r => res.render('home'));

})
app.get('/register',function (req,res) {
    var data = {
        title: "Register Page",
        cardHeading : "Register",
        login: false,
        register: true
    }
    res.render('account',data);
});

app.get('/registerTheUser',async function (req, res) {

    let regData = req.query;
    console.log(req.query);
    let emailCheck = await Model.checkEmailForRegister(req.query);
    console.log(emailCheck);
    for (const row of emailCheck) {
        let count = row['Count(*)'];
        if (count === 1) {
            var data = {
                title: "Register Page",
                cardHeading: "Register",
                login: false,
                register: true,
                errorRegisterEmail: true,
                dataForm: req.query
            }

            res.render('account', data);
        } else {
            var data = {
                title: "Login Page",
                cardHeading : "Login",
                login: true,
                register: false,
                accountCreated : true
            }
          await  Model.registerTheUser(regData).then(r => res.render('account',data));

        }
    }
    //res.send("Registration successful");
});

app.get("/background_landingPage.jpg", function (req,res){
    res.sendFile(__dirname + "/views/background_landingPage.jpg")
});

app.get('/registerIssue',function (req,res) {
    res.render('addIssue');
});

app.get('/skyline.jpg', function (req,res){
    res.sendFile(__dirname + '/views/skyline.jpg');
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