const util = require('util');
const axios = require("axios");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const TODO_API_URL = "https://hunter-todo-api.herokuapp.com";
var loggedinUser = [];

module.exports =  (app) => {
    app.use(cookieParser());

    //login page
    app.get("/", (req, res) => {
        res.render("login-page");
    });
    
    //home page when authorized
    app.get('/home', function (req, res, next) {
		res.render('home');
    })
    
    //sign up page
    app.get('/signup', function (req, res, next) {
		res.render('sign-up');
    });

    //sign up
    app.post('/signup', async function (req, res, next) {
        const newTargetUsername = req.body.inputNewUsername;
        console.log(newTargetUsername);

        const allUsers = (await axios.get(TODO_API_URL + '/user')).data;
       
        newMap = new Map();
        newMap = mapUsers(allUsers);

        //if username doesn't exist
        if(newMap.get(newTargetUsername) == undefined){
            await axios.post(TODO_API_URL + '/user',
                { username : newTargetUsername } );
            
                res.render('login-page', {
                message: 'User ' + newTargetUsername + ' successfully created. Login!',
                //messageClass: 'alert-danger'
            });
        } else {
            res.render('sign-up', {
                message: 'User ' + newTargetUsername + ' already exists, try another username.',
                //messageClass: 'alert-danger'
            });
        }
		
    });

    //login page
    app.get('/login', function (req, res, next) {
		res.render('login-page');
    });

    //login
    app.post('/login', async (req, res) => {
        const targetUsername = req.body.inputUsername;
        //console.log(targetUsername);

        const allUsers = (await axios.get(TODO_API_URL + '/user')).data;
        //console.log(allUsers);
       
        newMap = new Map();
        newMap = mapUsers(allUsers);

        if(newMap.get(targetUsername) !== undefined){
            loggedinUser.push(targetUsername);

            const token = (await axios.post(TODO_API_URL + '/auth',
                { username : targetUsername })).data.token;
            
            res.cookie('authToken', token);
            
                try{
                const toDoList = (await axios.get(TODO_API_URL + '/todo-item',
                    { headers : { 'Authorization' : token }})).data;
                
                res.render("home", { username: targetUsername, content : toDoList });
            }catch(error){
                //loggedinUser.push(targetUsername);
                res.cookie('authToken', token);
                res.render("home", { username: targetUsername});
            }
        } else {
            res.render('login-page', {
                message: 'Invalid username or password',
                //messageClass: 'alert-danger'
            });
        }
    });

    //add new task
    app.post('/addNewTask', async (req, res) => {
        const token = req.cookies.authToken;
        const newTask = req.body.inputNewTask;

        await axios.post(TODO_API_URL + '/todo-item',
            { content : newTask } , { headers : { 'Authorization' : token }});

        const toDoList = (await axios.get(TODO_API_URL + '/todo-item', { headers : { 'Authorization' : token }})).data;
        //console.log(toDoList);

        res.render("home", { username: loggedinUser, content : toDoList });
    });

    //delete task
    app.post('/deleteTask', async (req, res) => {
        const token = req.cookies.authToken;
        const taskID = req.body.taskID;

        //console.log(loggedinUser);
        
        try{
            await axios.delete(TODO_API_URL + '/todo-item/' + taskID,
                { headers : { 'Authorization' : token }});
        } catch (err){
            console.log(err);
        }

        const toDoList = (await axios.get(TODO_API_URL + '/todo-item',
            { headers : { 'Authorization' : token }})).data;

        //console.log(toDoList);

        res.render("home", { username: loggedinUser, content: toDoList } );
        
        //res.render("home", { username: loggedinUser, content: data } )

    });

    app.post('/complete', async (req, res) => {
        const token = req.cookies.authToken;
        const taskID = req.body.taskID;

        try{
            await axios.put(TODO_API_URL + '/todo-item/'+ taskID,
                { completed : true } , { headers : { 'Authorization' : token }});
        } catch (err){
            console.log(err);
        }

        const toDoList = (await axios.get(TODO_API_URL + '/todo-item',
            { headers : { 'Authorization' : token }})).data;

        res.render("home", { username: loggedinUser, content: toDoList } );
    });

    //logout
    app.get('/logout', (req, res) => {
        //clear cookie
        res.clearCookie('authToken');
        
        //clear loggedinUser
        loggedinUser = [];

        res.render('login-page', {
            message: 'Successfully logged out',
            //messageClass: 'alert-danger'
        });
    });

    require('./algo.js')(app);
}; 