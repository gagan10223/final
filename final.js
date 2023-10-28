const express = require('express')
const mongoose = require('mongoose')
const method = require('method-override')
const all_routes = require('./routers/routes')
const dburi = 'mongodb+srv://gagan:1234@cluster0.oljierj.mongodb.net/node?retryWrites=true&w=majority'
const session = require('express-session')
const mongo_session = require('connect-mongodb-session')(session)
const app = express();

mongoose.connect(dburi,{useNewUrlParser:true,useUnifiedTopology:true})
.then(result => app.listen(3000))
.catch(err => console.log(err))
console.log('error')

const store = new mongo_session({
    uri:dburi,
    collection:'sessions'
})
app.use(session({
    secret:'Secret Key',
    resave:false,
    saveUninitialized:false,
    store:store
}))


app.use(method('_method'));

app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');

app.use(all_routes)