const {Blog} = require('../modules/schema');
const {Email} = require('../modules/schema');
const {Users} = require('../modules/schema');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');
const AWS = require('aws-sdk');

AWS.config.update({region:'us-east-1'});



const final = (req,res) => 
{
    res.render('main')
}

const login = (req,res) =>{
    res.render('login')

}
const signup = (req,res) =>{
    res.render('signup')
}

const verify = (req,res) =>
{
    const email = req.body.email;
    const crypto_token = () =>{
        return crypto.randomBytes(4).toString('hex')
    }
    const token = crypto_token();

    const email_content = `Your Verification token ${token}`;

    Email.create({email:email, token:token})
    .then(result =>{
        const params = {
            Destination:{
                ToAddresses:[email]
            },
            Message:{
                    Body:{
                        Html:{
                            Charset:'UTF-8',
                            Data:email_content
                        },
                    },
                    Subject:{
                        Charset:'UTF-8',
                        Data:'Email Verification'
                    }
            },
            Source:'blogs@gagandeep.pro'
        } 
        const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
        sendPromise
        .then(data => {
            res.render('token_verify')
        })
        .catch(err => {
            res.status(500).send('Error sending the email')
        })
    })
    .catch(err => {
        console.log(err)
        console.error('Error creating the email document')
        res.sendStatus(500);
    })
}
const verify_token = (req,res) => {
    const token = req.body.token;
    Email.findOne({token:token})
    .then(result => {
        res.render('create_user',{'message':'Token verified successfully'})
    })
    .catch(err => {
        console.error(err)
        res.status(500).send('Token verification failed')
    })
}
const verify_user = async(req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmation = req.body.confirmation;

     const user = await Users.findOne({username});
     if (user)
     {
        res.redirect('/signup')
     }

    const check_space = (input) => 
    {
        return /\s/.test(input)
    }

    if (check_space(username) || check_space(username) || check_space(username))
    {
        console.log('Error: Username, password, or confirmation contains whitespace')
        res.status(500).send('Please do not use any white space')
    }
    else 
    {
        if (password == confirmation)
        {
            const hashed = await bcrypt.hash(password,12)
            Users.create({username:username,password:hashed})
            .then(result => {
                Email.deleteMany({})
                .then(result => {
                    res.render('login')
                })
                .catch(err => {
                    res.status(500).send('Error creating the user')
                })
            })
            .catch(err =>  {
                res.status(500).send('Error creating the user')
            })
        }
        else
        {
            res.status(500).send('Passwords does not match')
        }
    }
}

const log_in = async (req,res) => 
{
    const username = req.body.username;
    const password = req.body.password;

    const user = await Users.findOne({username});

    if(!user)
    {
        console.log('invalid username or password');
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
        req.session.isAuth = true;
        req.session.user = username;
        return res.redirect('/home');
    }
    console.log('Invalid username or password');
    res.redirect('/login');
}

const home = (req,res) => 
{
    console.log(req.session.isAuth)
    const username = req.session.user;
    if(req.session.isAuth)
    {    
        Blog.find({username})
        .then((blogs) => {
            return res.render('home', { blogs });
        })
        .catch((error) => {
            return res.status(500).send('An error occurred: ' + error.message);
        });
    }
    else
    {
        return res.redirect('/')
    }
}

const about = (req,res) => 
{
    console.log(req.session.isAuth)
    if(req.session.isAuth)
    {
        const blogs = null;
        return res.render('about',{blogs})
    }
    res.redirect('/')

}

const create = (req,res) => 
{
    if (req.session.isAuth)
    {
        username = req.session.user
        return res.render('create',{username});
    }
    res.redirect('/')

}


const create_post = (req, res) => {
    console.log('herecreated');

    if (req.session.isAuth) {
        console.log('bcreated');

        const blog = new Blog(req.body);
        blog.save()
            .then(result => {
                console.log('created');
                return res.redirect('/home');
            })
            .catch(err => {
                console.log(err);
                return res.redirect('/create', { username: req.session.user });
            });
    } else {
        // Add an else block to handle the case when req.session.isAuth is false
        res.redirect('/');
    }
};


const details = (req,res) => 
{
    if (req.session.isAuth)
    {
        const id = req.params.id;
        Blog.findById(id)
        .then(result => {
        return res.render('details',{details:result});
        })
        .catch(err => console.log(err))
    }
    else {
        return res.redirect('/')
    }
}

const delete_ = (req,res) =>
{
    if (req.session.isAuth)
    {
        const id = req.params.id;
        Blog.findByIdAndDelete(id)
        .then((result) => {
            return res.json({redirect:'/home'})
        })
        .catch(err => {
            console.error('Error occurred:', err);
            return res.status(500).send('Error deleting the document');
        });
    }
    else{
        return res.redirect('/')
    }
}

const edit_data = (req,res) => 
{
    if (req.session.isAuth)
    {
        const id = req.params.id;
        Blog.findById(id)
        .then((result)=>{
            return res.render('edit',{data:result,username:req.session.user})    
        })
        .catch(err => console.log(err)) 
    }
    else{
        return res.redirect('/')
    }
}

const edited = (req,res) => 
{
    if (req.session.isAuth)
    {
        const id = req.params.id;
        const body = req.body;

        Blog.findByIdAndUpdate(id,body,{ new: true})
        .then(updateBlog => {
            if (!updateBlog){
                  return res.status(404).send('Blog Post not found')
                 }
            return res.redirect(`/details/${updateBlog.id}`)
        })
        .catch(err =>{
             console.error('Error occurred: ', err);
             return res.status(500).send('Error updating the document')
            })
    }
    else{
        return res.redirect('/')
    }
}

const log_out = (req,res) =>
{
    req.session.destroy((err) =>{
        if (err) throw err;
        res.redirect('/');
    })
}


module.exports = {
    final,
    login,
    signup,
    verify_token,
    verify,
    verify_user,
    log_in,
    home,
    about,
    create_post,
    create,
    details,
    edit_data,
    edited,
    delete_,
    log_out
}