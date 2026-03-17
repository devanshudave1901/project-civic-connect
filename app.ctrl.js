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
    let deptType = req.query.deptType;
    let data = await Model.getIssueById(issueId);
     let comments = await Model.getCommentsByIssueId(issueId);
     // loop through the comments and save the list of comments in data.comments
        data.comments = [];
        comments.forEach(function (r) {
            data.comments.push(r.issueComment);
        });

    let statusDataReturned = data.statusName;
    console.log("Status data returned: " + deptType);
    if(deptType === "null" || deptType === null || deptType === undefined || deptType !== "")
    {
        data.noButtons = true;
        data.editButton = false;

    }
    else{
        data.noButtons = false;
        data.editButton = true;
    }
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
app.get("/submitComment", async function (req,res) {
   let data = req.query;
   console.log("Submitting comment for issue id: " + data.issueId + " by user id: " + data.userId);
   await Model.addComment(data).then(r => res.redirect('/view/' + data.issueId));
});
app.get('/addComment/:id', async function (req,res) {
    let issueId = req.params.id;
    let user = req.query.user;

    let data = {
        issueId: issueId,
        user: user
    }

    console.log("Adding comment for issue id: " + issueId + " by user id: " + user);
    res.render('addComment',data);

});
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
    let userId1 = req.query.user;
    console.log("User ID from query parameter in edit issue: " + userId1);
    dataForm1.userId = userId1;

    console.log("Image " , data.issuePhoto);
    // changing the buffer data of the image to base64 string to be able to render it on the edit page
    // if(data.issuePhoto !== null)
    // {
    //     // making the buffer in a way that it can be reuploaded to the input type file on the edit page
    //     let bufferData = data.issuePhoto;
    //     let base64Data = bufferData.toString('base64');
    //     let dataUrl = 'data:image/jpg;base64,' + base64Data;
    //
    //     console.log("Data URL: ", dataUrl);
    //     dataForm1.dataForm.issuePhoto = dataUrl;
    // }
        data.title21 = "Edit Issue";
        res.render('addIssue', dataForm1);

})
app.get('/home',async function (req, res) {

    console.log("User ID from query parameter: " + req.query.user);
    console.log("User ID from query parameter: " + req.query.deptType);

    let user = req.query.user;
    let tableData;
    if(req.query.deptType !== undefined)
    {
        console.log("inside get all issues by type");
         tableData = await Model.getAllIssuesByType(req.query);

    }
    else{
         tableData = await Model.getAllIssues(req.query);
    }
    let data = {
        title1: "Home Page",
        userId: req.query.user,
        tableData: []

    }
    console.log("Department type from query parameter: " + req.query.deptType);
    if(req.query.deptType === undefined)
    {
        data.superAdmin = true;

    }
    else
    {
        data.superAdmin = false;
    }
    data.deptType= req.query.deptType;
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
            console.log("user details: " + userDetails[0]);
            var data = {
                user: userDetails
            }
            let userDepartmentType = userDetails[0].userDeptType;
            let userType = userDetails[0].userTypeId;

            // if user type = 1 then straight to home page with all the data from all the departments
            if(userType === 1)
            {
                console.log("Inside 1")

                // sending the usertype of admin to see all the data from all the departments in the home page
                res.redirect(`home/?user=${userDetails[0].id}&deptType=all`);
            }
            // else if user type is not 1 and departmenttype is not null then to home page with the data of the relevant department
            else if(userDepartmentType !== "null" && userDepartmentType !== null)
            {
                console.log("Inside 2")

                // sending the usertype of transit, roads to see all the data from relevant department in the home page
                res.redirect(`home/?user=${userDetails[0].id}&deptType=${userDepartmentType}`);
            }
            else
            {
                console.log("Inside3")

                console.log("Wnt to null")
                res.redirect(`home/?user=${userDetails[0].id}`);
            }


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
            let userEmail = regData.userEmailAddress;

            console.log("user email: " + userEmail);

            // based on userEmailAddress domain decide the level of the usertype
            if(userEmail.endsWith("@transit.com")){
                console.log("User is transit department");
                regData.userDeptType = 1;
                regData.userTypeId =3;
            }
            else if(userEmail.endsWith("@roads.com")){
                console.log("User is roads department");

                regData.userDeptType = 2;
                regData.userTypeId =3;
            }
            else if(userEmail.endsWith("@waste.com")){
                regData.userDeptType = 3;
                regData.userTypeId =3;
            }
            else if(userEmail.endsWith("@water.com")){
                regData.userDeptType = 4;
                regData.userTypeId =3;
            }
            else if(userEmail.endsWith("@electricity.com")){
                regData.userDeptType = 5;
                regData.userTypeId =3;
            }
            else if(userEmail.endsWith("@parking.com")){
                regData.userDeptType = 6;
                regData.userTypeId =3;
            }
            else if(userEmail.endsWith("@admin.ca")){
                regData.userDeptType = null;
                regData.userTypeId =1;
            }
            else{
                regData.userDeptType = null;
                regData.userTypeId = 2;

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
app.get('/responsive.css',function (req,res){
    res.sendFile(__dirname + '/views/responsive.css');
});
app.get('/view/responsiveView.css',function (req,res){
    res.sendFile(__dirname + '/views/responsiveView.css');
});
app.get('/home/responsiveHome.css',function (req,res){
    res.sendFile(__dirname + '/views/responsiveHome.css');
});
app.get('/responsiveHome.css',function (req,res){
    res.sendFile(__dirname + '/views/responsiveHome.css');
});
app.get('/addComment/:id/responsive.css',function (req,res){
    res.sendFile(__dirname + '/views/responsive.css');
});
app.get('/edit/:id/responsive.css',function (req,res){
    res.sendFile(__dirname + '/views/responsive.css');
});

app.get('/output.css',function (req,res){

   res.sendFile(__dirname + '/views/output.css');
});
app.listen(3000, function () {
    console.log("Server is running on port 3000");
});