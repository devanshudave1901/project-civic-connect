const sqlite3 = require('sqlite3').verbose()
const sqlite = require('sqlite');
const {restart} = require("nodemon");

let dataBase;

async function dataBaseConnection() {
    dataBase = await sqlite.open({
        filename: 'civicConnect.db',
        driver: sqlite3.Database
    })
    console.log("Database connection established");
}

async function getLogin(login)
{

    let userName = login.userEmailAddress;
    let password = login.userPassword;
    console.log("Checking login for user: " + userName);
    console.log("Checking login with password: " + password);

    const results = await  dataBase.all("Select Count(*) from Users where email = ? and password = ?", [userName, password])

    return results
}

async function getAllIssues(){
    const results = await dataBase.all("Select IssueLog.id, IssueLog.IssueCategoryId, IssueLog.issueTitle,IssueLog.issueDescription ,IssueLog.issueCreatedDate,IssueLog.issueUpdatedDate,IssueLog.isDeleted, IssueCategory.categoryName, IssueStatus.statusName from IssueLog INNER JOIN IssueCategory ON IssueLog.issueCategoryId = IssueCategory.id INNER JOIN IssueStatus ON IssueLog.issueStatusId = IssueStatus.id where IssueLog.isDeleted = 0")
    return results
}


async function registerTheUser(register)
{
    console.log(register);
    let firstName = register.userFirstName;
    let lastName = register.userLastName;
    let email = register.userEmailAddress;
    let phoneNumber = register.userPhoneNumber;
    let username = register.userName;
    let password = register.userPassword;
    let userTypeId = 2;

    await dataBase.run("Insert into Users (firstName, lastName, email, phoneNumber, username, password, userTypeId) values (?, ?, ?, ?, ?, ?, ?)",
        [firstName, lastName, email, phoneNumber, username, password, userTypeId]);

    console.log("User registered successfully");
}
async  function insertIssue(issue){
    const now = new Date();
 console.log(issue)
    let issueTitle = issue.issueTitle;
    let issueDescription = issue.issueDescription;
    let issueCategoryId =  parseInt(issue.issueCategory);
    let userId = 2;
    let issueStatusId = 1;
    let issueCreatedDate = now.toISOString();
    let issueUpdatedDate  = now.toISOString();
    let isDeleted = 0;
    let issuePhoto = issue.isssueImage;
   await dataBase.run("Insert into IssueLog (issueTitle, issueDescription, issueCategoryId, issueUserId, issueStatusId, issueCreatedDate, issueUpdatedDate, isDeleted, issuePhoto) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [issueTitle, issueDescription, issueCategoryId, userId, issueStatusId, issueCreatedDate, issueUpdatedDate, isDeleted, issuePhoto]);

    console.log("Issue inserted successfully");
}
async function checkEmailForRegister(register)
{
    console.log(register);

    let userEmailAddress = register.userEmailAddress;
    console.log("Checking email: " + userEmailAddress);
    const results = await dataBase.all("Select Count(*) from Users where email = ?", [userEmailAddress])
    console.log(results);
    return results
}

module.exports = {dataBaseConnection, getLogin,checkEmailForRegister,registerTheUser,insertIssue,getAllIssues}