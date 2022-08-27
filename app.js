//jshint esversion:6
require('dotenv').config();
// var md5 = require('md5');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose  = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const bcrypt = require('bcrypt');
// const saltrounds = 10;
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require("express-session");

const app = express();

app.use(express.static("public"));
app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({
    extended : true
}));

app.use(session({
    secret: 'my little secret.',
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret : process.env.SECRET, encryptedFields : ["password"]});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});


app.get("/",function(req,res){
    res.render("home");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})
app.get("/logout",function(req,res){
    req.logOut(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/")
        }
    })
})

app.post("/register", function(req,res){
    User.register({username : req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
})

app.post("/login", function(req,res){
    const user = new User({
        email : req.body.username,
        password: req.body.password
    })
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
})

app.listen(4000, function(){
    console.log("server started on port 4000");
})