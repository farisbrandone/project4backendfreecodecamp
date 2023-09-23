import mongoose from "mongoose";
import { Schema } from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
    },

});

const exerciceSchema= new mongoose.Schema({
    username:{
        required: true,
        type: String,
       
    },
    description:{
        required: true,
        type: String,
       
    },
    duration: {
        required: true,
        type: Number,
    },
    date: {
        type:Date,
        default:new Date(),
    },
    users:  {
        type: Schema.Types.ObjectId,
        ref:"User"
    }, 
})




const logSchema=new mongoose.Schema({
    username:{
        required: true,
        type: String,
       
    },
    count:{
        required: true,
        type: Number,
        default: 0,
    },
    id:  {
        type: Schema.Types.ObjectId,
        ref:"User"
    }, 
    log:{ required: true,
         type:Array,
         default: [],
    }
}) 

const User = mongoose.model("User", userSchema);
const Exercice=mongoose.model("Exercice", exerciceSchema);
const Log = mongoose.model("Log", logSchema);

export {User, Exercice, Log};