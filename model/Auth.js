const mongoose = require('mongoose')
const passport = require('passport')
const passportLocalMongoose = require("passport-local-mongoose")
const LocalStrategy = require('passport-local').Strategy

const {Schema, model} = mongoose


const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String
}, {timestamps: true})

userSchema.plugin(passportLocalMongoose)
const userModel = model("User", userSchema)
passport.use(new LocalStrategy(userModel.authenticate()))
passport.use(userModel.createStrategy())
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

module.exports = userModel