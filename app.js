const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const uuid = require('uuid');
const PORT = process.env.PORT || 3000;
let editUSER = {};
let Users = [], FileUsers = [];
//IM UNAWARE HOW TO GET RID OF THE MONGODB "the options __ is not supported."// using client.close() causes npm to crash.
//IRON-CLOUD-CONNECT//--THIS IS DATABASE FOR PROJECT 6/
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb+srv://Ironinstrumentals:fathercommunism@iron-cloud-sobzn.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true, server: { socketOptions: { keepAlive: 0, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 0, connectTimeoutMS: 30000 } }});
//END OF IRON-CLOUD//
function saveFile() {
    client.connect(err => {
        const collection = client.db("simple-user-manager").collection("Users");
        collection.findOneAndReplace({"_id":"UserCollection"}, {"Users":Users});
    });//THIS IS USED FOR PROJECT 6
    fs.writeFile('Users.txt', JSON.stringify(Users), 'utf8', (err) => {
        if (err) throw err;
        else console.log('Saved To Text File Users.txt!');
    });
}
function readFile() {
    client.connect(err => {
        const collection = client.db("simple-user-manager").collection("Users");
        collection.findOne({"_id":"UserCollection"}, (err, data) => {
            if (err) throw err;
            Users = data.Users;
        });
    });//THIS IS USED FOR PROJECT 6
    fs.readFile('Users.txt', 'utf8', (err, data) => {
        if (err) throw err;
        else {
            FileUsers = data;
            //This Comment would be how i grab the data from Users.txt
            //Users = data;
        }
    })
}
function addUser(data) {
    let newUser = {
        UserID: uuid(),
        email: data.email.toLowerCase(),
        FirstName: data.FirstName.toLowerCase(),
        LastName: data.LastName.toLowerCase(),
        age: data.age
    };
    Users.push(newUser);
    saveFile();
}
function deleteUser(UUID) {
    for (let i = 0; i < Users.length; i++) {
        if (Users[i].UserID == UUID) {
            Users.splice(i, 1);
            saveFile();
        }
    }
}
function setEdit(data) {
    readFile();
    for (let i = 0; i < Users.length; i++) {
        if (Users[i].UserID == data) {
            editUSER = Users[i];
        }
    }
}
function updateUser(data) {
    for (let i = 0; i < Users.length; i++) {
        if (Users[i].UserID  == data.UserID) {
            Users[i] = data;
            editUSER = {};
            saveFile();
        }
    }
}
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    readFile();
    res.render('index.ejs', { PORT: PORT });
    readFile();
});
app.get('/create', (req, res, next) => {
    res.render('create.ejs', { PORT: PORT });
    next();
});
app.get('/list', (req, res, next) => {
    readFile();
    res.render('list.ejs', { PORT: PORT });
    readFile();
    next();
});
app.get('/edit', (req, res, next) => {
    res.render('edit.ejs', { PORT: PORT });
    next();
});
io.on('connection', function(socket){
    readFile();
    io.emit('UserList', Users);
    socket.on('ADDUSER', function(data) {
        addUser(data);
    });
    socket.on('DELETEUSER', function(data) {
        deleteUser(data);
    });
    socket.on('SETEDIT', function(data) {
        setEdit(data);
    });
    socket.on('UPDATEUSER', function(data) {
        console.log('');
        updateUser(data);
    });
    socket.on('GETEDIT', function (data) {
        io.emit('USEREDIT', {UserID: editUSER.UserID, email: editUSER.email, FirstName: editUSER.FirstName, LastName: editUSER.LastName, age: editUSER.age});
    });
});
http.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`);
    readFile();
});