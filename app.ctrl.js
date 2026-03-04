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
app.get('/view/:id',async function (req, res) {
    let issueId = req.params.id;
    let data = await Model.getIssueById(issueId);

    let statusDataReturned = data.statusName;
    if(statusDataReturned === 'Open')
    {
          data.statusOpen = true;
          data.statusProcessing = false;
          data.closed = false;
          data.openedData = true;
          data.dataSubmitted = true;


    }
    else if(statusDataReturned === 'In Progress')
    {
        data.statusOpen = true;
        data.statusProcessing = false;
        data.closed = false;

        data.proccesingPending = true;
        data.proccessingDone = false;
        data.openedData = true;


    }
    else if(statusDataReturned === 'Closed')
    {
        data.statusProcessingTick = true;
        data.statusProcessingFalse = true
        data.statusOpen = true;
        data.proccessingDone = true;
        data.statusProcessing = true;
        data.closed = true;
        data.openedData = false;

    }


    data.title21 = "View Issue";
    console.log(data);
    res.render('viewFile', data);
})
app.get('/delete/:id',function (req,res) {
    let issueId = req.params.id;
    Model.deleteIssue(issueId).then(r => res.redirect('/home?user=' + req.query.user));
})
app.get('/edit/:id',async function (req,res) {

    let issueId = req.params.id;
        let data = await Model.getIssueById(issueId);
        console.log(data);
   let dataForm1 = {
        dataForm: data,
       edit:true
    }
        data.title21 = "Edit Issue";
        res.render('addIssue', dataForm1);

})
app.get('/home',async function (req, res) {

    console.log("User ID from query parameter: " + req.query.user);
    let tableData = await Model.getAllIssues(req.query);
    let data = {
        title1: "Home Page",
        userId: req.query.user,
        tableData: []

    }
    tableData.forEach(function (r) {
        console.log(r);
        data.tableData.push(r);
    })
    console.log(data);
    res.render('home', data);




});

app.get('/changeStatus', async function (req,res) {
   await Model.changeStatus(req.query);
   res.redirect('/view/' + req.query.issueId);
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
    for (const row of result) {
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
            var userDetails = await Model.loginUserDetails(req.query);
            var data = {
                user: userDetails
            }

            res.redirect(`home/?user=${userDetails[0].id}`);
        }
    }

});

app.get('/submitIssue', async  function (req,res) {
    let issueData = req.query;

    await Model.insertIssue(issueData).then(r => res.redirect('home/?user=' + issueData.issueUser));

})
app.get('/updateIssue', async  function (req,res) {
    let issueDataForm = req.query;

    const result = await  Model.updateIssue(issueDataForm);
    console.log("Result from update issue: " + result);
    console.log(issueDataForm)
    res.redirect('view/' +issueDataForm.issueId);


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
app.get("big-city.jpg", function (req,res){
    console.log("Image called")
    res.sendFile(__dirname + "/views/big-city.jpg")
});
app.get('/registerIssue',function (req,res) {

    console.log("User ID from query parameter in register issue: " + req.query.user);
    const data = {
        userId: req.query.user,
        addIssue: true,
    }
    res.render('addIssue',data );
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