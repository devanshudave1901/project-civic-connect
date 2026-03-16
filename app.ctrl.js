const express = require('express');
const app = express();
const imageUpload = require('express-fileupload');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(imageUpload());

const mustache = require('mustache-express');
const Model = require('./app.model');
const buffer = require("buffer");



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
    // changing data.issuePhoto which has buffer.base64 to viewable image.
    if (data.issuePhoto !== null) {


        let image = data.issuePhoto;

        const bufferFrom = Buffer.from(image, 'base64');
        const base64Data = bufferFrom.toString('base64');
        let dataUrl = 'data:image/jpg;base64,' + base64Data;

        data.issuePhoto = dataUrl;


    }

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
    console.log("Image " , data.issuePhoto);
    // changing the buffer data of the image to base64 string to be able to render it on the edit page
    if(data.issuePhoto !== null)
    {
        // making the buffer in a way that it can be reuploaded to the input type file on the edit page
        let bufferData = data.issuePhoto;
        let base64Data = bufferData.toString('base64');
        let dataUrl = 'data:image/jpg;base64,' + base64Data;

        console.log("Data URL: ", dataUrl);
        dataForm1.dataForm.issuePhoto = dataUrl;
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


app.post('/submitIssue', async  function (req,res) {
    // data
    console.log("Submitting issue. .....");
    console.log(req.body);

    let photoData = req.files.issuePhoto;

    if(photoData !== undefined)
    {
        const buffer = photoData.data;
        req.body.issuePhoto =  buffer;
    }
    else{
        req.body.issuePhoto = null;
    }
    await Model.insertIssue(req.body).then(r => res.redirect('home/?user=' + req.body.issueUser));

});

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
        edit:false,
        title21:'Add the issue'
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