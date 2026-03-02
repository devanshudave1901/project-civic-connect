
const sqlite3 = require('sqlite3').verbose()
const sqlite = require('sqlite');

async function initdb() {
    const db = await sqlite.open({
        filename: 'civicConnect.db',
        driver: sqlite3.Database
    })
    await db.exec("Drop Table If exists UserTypes")
    await db.exec("Drop Table If exists Users")
    await db.exec("Drop Table If exists IssueCategory")
    await db.exec("Drop Table If exists IssueStatus")

    await db.exec("Drop Table If exists IssueLog")

    await db.exec(`
        CREATE TABLE IF NOT EXISTS UserTypes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userTypeName TEXT NOT NULL
        )
    `)
    const userTypeStatement = await db.prepare("Insert into UserTypes (userTypeName) values (?)")
    await userTypeStatement.run("Admin")
    await userTypeStatement.run("Citizen")
    await userTypeStatement.run("Department Official")

    console.log("Database initialized")
    const result1 = await db.all("Select * from UserTypes")

    console.log(result1)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT NOT NULL,
            phoneNumber TEXT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            userTypeId INTEGER NOT NULL,
            Foreign Key (userTypeId) References userTypes(id)
        )
    `)

    await db.exec(`
        CREATE TABLE IF NOT EXISTS IssueCategory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoryName TEXT NOT NULL
        )
    `)

    await  db.exec(`
        CREATE TABLE IF NOT EXISTS IssueStatus (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            statusName TEXT NOT NULL
        )
    `)
    const issueStatusStatement = await db.prepare("Insert into IssueStatus (statusName) values (?)")
    await issueStatusStatement.run("Open")
    await issueStatusStatement.run("In Progress")
    await issueStatusStatement.run("Closed")


    const issueCategoryStatement = await db.prepare("Insert into IssueCategory (categoryName) values (?)")
    await issueCategoryStatement.run("Transit")
    await issueCategoryStatement.run("Road")
    await issueCategoryStatement.run("Waste")
    await issueCategoryStatement.run("Water")
    await issueCategoryStatement.run("Electricity")
    await issueCategoryStatement.run("Parking")

    await  db.exec(`   
        CREATE TABLE IF NOT EXISTS IssueLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issueCategoryId INTEGER NOT NULL,
            issueStatusId INTEGER NOT NULL,
            issueUserId INTEGER NOT NULL,
            issueTitle TEXT NOT NULL,
            issueDescription TEXT NOT NULL, 
            issuePhoto BLOB  NULL,
            issueCreatedDate TEXT NOT NULL,
            issueUpdatedDate TEXT NOT NULL,
            isDeleted boolean NOT NULL,
            Foreign Key (issueCategoryId) References issueCategory(id),
            Foreign Key (issueUserId) References Users(id),
            Foreign Key (issueStatusId) References issueStatus(id)
            
        )
    `)


    const statement = await db.prepare("Insert into Users (firstName, lastName,email, phoneNumber,username, password,userTypeId) values (?,?, ?,?,?,?,?)")
    await statement.run("admin","admin","admin@city.ca","1234567894","admin", "admin123",1)

    const result = await db.all("Select * from Users")

    console.log("Database initialized")
    console.log(result1)

    console.log(result)
}

initdb();

