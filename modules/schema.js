const mongoose = require('mongoose');

const schema = mongoose.Schema;

const users = new schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
    },
    {timestamps:true}
)
const note = new schema(
    {
        username:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        snippet:{
            type:String,
            required:true
        },
        body:{
            type:String,
            required:true
        }

    },{timestamps:true}
)

const email_token = new schema(
    {
        email:{
            type:String,
            required:true
        },
        token:{
            type:String,
            required:true
        }
    }
)

const Blog = mongoose.model('blog',note);
const Email = mongoose.model('email',email_token);
const Users = mongoose.model('user',users);

module.exports = {
    Blog,
    Email,
    Users
}

