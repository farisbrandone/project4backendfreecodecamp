import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors"
import bodyParser from 'body-parser';
/* const express = require('express')

const cors = require('cors')
require('dotenv').config()
const bodyParser =require('body-parser'); */
import {
  User,
  Exercice,
  Log
} from './models/userModel.js';
console.log(`${process.cwd()}/public`)
dotenv.config();
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}));
/* app.use(express.json({limit:"30mb", extended: true}));
app.use(express.urlencoded({limit:"30mb", extended: true})); */
app.use(express.static(`${process.cwd()}/public`))
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html')
});


app.post("/api/users", async (req, res) => {
  const {
    username
  } = req.body
  try {
    const userFind = await User.findOne({
      username
    })
    if (userFind) {
      res.json({
        username: userFind.username,
        _id: userFind._id
      });
    } else {
      let USER = new User({
        username
      });
      await USER.save();
      res.json({
        username: USER.username,
        _id: USER._id
      });
    }
  } catch (err) {
    res.send("problème of connection");
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const userFind = await User.find({}, {
      username: 1,
      _id: 1
    })
    res.json(userFind)
  } catch (err) {
    res.send("problème of connection");
  }

})

app.post("/api/users/:_id/exercises", async (req, res) => {
  const {
    description,
    duration,
    date
  } = req.body
  const _id = req.params._id
 /*  console.log({
    description,
    duration,
    date,
    _id
  }) */
  let dateConvert=new Date(date)

    if (Number(dateConvert.valueOf()) && date!==""){
       dateConvert = new Date(date)
    }
    else if (date==="" || date===undefined){
      dateConvert=new Date()
    }
    else {
      console.log("nohhhhhhhhhhhhhhhhhhhhh")
      res.json({error:"une erreur au niveau de la date"})
    }
  
  try {
   /*  console.log("toc toc") */
    const user = await User.findOne({
      _id
    })
    /* console.log(user) */
   
     /*  console.log("dada") */
      const exerciceUser = new Exercice({
        username: user.username,
        users: user._id,
        description,
        duration,
        date: dateConvert,
      })
      const result = await exerciceUser.save()
      const id = result.users
     /*  console.log("id exercice : ", id)
      console.log("baba", result.date.toUTCString()) */
      const log = await Log.findOne({
        id
      })
      if (log) {
        const objectexc = {
          description: result.description,
          duration: result.duration,
          date: result.date.toDateString()
        }
        const newLog = await Log.findOneAndUpdate({
          id
        }, {
          $inc: {
            count: 1
          },
          $push: {
            log: objectexc
          }

        }, {
          new: true
        })
        
      } else {

        const objectexc = {
          description: result.description,
          duration: result.duration,
          date: result.date.toDateString()
        }
        const newLog = new Log({
          username: result.username,
          count: 1,
          id: result.users,
          log: [{
            ...objectexc
          }]
        })
        await newLog.save()
      }
     /*  const exerciceResult = await Exercice.findById(result._id) */
      const date = result.date.toDateString()
      res.json({
        _id: result.users.toString(),
        username: result.username,
        date: date,
        duration: result.duration,
        description: result.description,
      })

  } catch (err) {
    res.send(err);
  }
})

app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id
  const {from,to, limit,}=req.query
  console.log( {from,to, limit, id})
  const fromDate=new Date(from)
  const toDate= new Date(to);
  const limitDate=Number(limit)
  let minDate=new Date('1970-01-01Z00:00:00:000')
  let maxDate = new Date(8640000000000000);
  const ObjectId = mongoose.Types.ObjectId
 const trueData= await Exercice.aggregate([
    
    {  $match:{
          users:new ObjectId(id),
           date:{
            $gt:new Date(from&&fromDate.toString()!=="Invalid Date"&&toDate.toString()!=="Invalid Date"?from:minDate),
            $lt:new Date(to&&fromDate.toString()!=="Invalid Date"&&toDate.toString()!=="Invalid Date"?to:maxDate)
          } 
      }},
     { $group:{
        _id:"$users",
        username: { "$first": "$username" },
        count: { $count: { } },
        log:{
          $push:{
            date:"$date",
            duration:"$duration",
            description:"$description",
          },
          
         
        }
      }},
      { "$project": { 
        "log": { "$slice": [ "$log", Number(limit)?limit:Math.pow(2, 10) ] },
        "username": 1,
        "count": 1
    }},
    
  ])

   const loga=trueData[0].log.map(elt=>({...elt, date:elt.date.toDateString()}))
const result={...trueData[0], log:loga} 
  res.json(result)
  
  
 /*  try {
   
    const logResults = await Log.findOne({
      id
    })
    let logTable=[]
    let i=0
    let j=1
    if(fromDate.toString()!=="Invalid Date" && toDate.toString()!=="Invalid Date" && limitDate && Boolean(logResults)){
    let  fromValue=fromDate.valueOf()
    let  toValue=toDate.valueOf()

      while (i<logResults.log.length && j<=limitDate){
        
         const logElt=new Date(logResults.log[i].date)

         if  (logElt.valueOf()>=fromValue && logElt.valueOf()<=toValue){
          logTable.push(logResults.log[i])
          j=j+1
         }
         i=i+1
  
      } 
      console.log("first",{
        _id: logResults.id,
        username: logResults.username,
        from:fromDate.toDateString(),
        to:toDate.toDateString(),
        count: limitDate,
        log:logTable
      })
      res.json({
        _id: logResults.id,
        username: logResults.username,
        from:fromDate.toDateString(),
        to:toDate.toDateString(),
        count: limitDate,
        log:logTable
      })
  
    }else if(fromDate.toString()!=="Invalid Date" && toDate.toString()!=="Invalid Date" && !limit && Boolean(logResults)){
      let  fromValue=fromDate.valueOf()
      let  toValue=toDate.valueOf()
  
        while (i<logResults.log.length){
          
           const logElt=new Date(logResults.log[i].date)
  
           if  (logElt.valueOf()>=fromValue && logElt.valueOf()<=toValue){
            logTable.push(logResults.log[i])
            j=j+1
           }
           i=i+1
    
        } 
        console.log("second",{
          _id: logResults.id,
          username: logResults.username,
          from:fromDate.toDateString(),
          to:toDate.toDateString(),
          count: limitDate,
          log:logTable
        })
        res.json({
          _id: logResults.id,
          username: logResults.username,
          from:fromDate.toDateString(),
          to:toDate.toDateString(),
          count:j-1,
          log:logTable
        })
    
      }else if(fromDate.toString()!=="Invalid Date" && !to && limitDate && Boolean(logResults)){
        let  fromValue=fromDate.valueOf()
        
    
          while (i<logResults.log.length && j<=limitDate){
            
             const logElt=new Date(logResults.log[i].date)
    
             if  (logElt.valueOf()>=fromValue ){
              logTable.push(logResults.log[i])
              j=j+1
             }
             i=i+1
      
          } 
          console.log("third",{
            _id: logResults.id,
            username: logResults.username,
            from:fromDate.toDateString(),
            to:toDate.toDateString(),
            count: limitDate,
            log:logTable
          })
          res.json({
            _id: logResults.id,
            username: logResults.username,
            from:fromDate.toDateString(),
            count:j-1,
            log:logTable
          })
      
        }else if(toDate.toString()!=="Invalid Date" && !from && limitDate && Boolean(logResults)){
          let  toValue=toDate.valueOf()
          
      
            while (i<logResults.log.length && j<=limitDate){
              
               const logElt=new Date(logResults.log[i].date)
      
               if  (logElt.valueOf()<=toValue ){
                logTable.push(logResults.log[i])
                j=j+1
               }
               i=i+1
        
            } 
            console.log("fourth",{
              _id: logResults.id,
              username: logResults.username,
              from:fromDate.toDateString(),
              to:toDate.toDateString(),
              count: limitDate,
              log:logTable
            })
            res.json({
              _id: logResults.id,
              username: logResults.username,
              to:toDate.toDateString(),
              count:j-1,
              log:logTable
            })
        
          }else if(fromDate.toString()!=="Invalid Date" && !to && !limit && Boolean(logResults)){
            let  fromValue=fromDate.valueOf()
            
        
              while (i<logResults.log.length){
                
                 const logElt=new Date(logResults.log[i].date)
        
                 if  (logElt.valueOf()>=fromValue ){
                  logTable.push(logResults.log[i])
                  j=j+1
                 }
                 i=i+1
          
              } 
              console.log("fith",{
                _id: logResults.id,
                username: logResults.username,
                from:fromDate.toDateString(),
                to:toDate.toDateString(),
                count: limitDate,
                log:logTable
              })
              res.json({
                _id: logResults.id,
                username: logResults.username,
                from:fromDate.toDateString(),
                count:j-1,
                log:logTable
              })
          
            }else if(toDate.toString()!=="Invalid Date" && !from && !limit && Boolean(logResults)){
              let  toValue=toDate.valueOf()
              
          
                while (i<logResults.log.length){
                  
                   const logElt=new Date(logResults.log[i].date)
          
                   if  (logElt.valueOf()<=toValue ){
                    logTable.push(logResults.log[i])
                    j=j+1
                   }
                   i=i+1
            
                } 
                console.log("sixth",{
                  _id: logResults.id,
                  username: logResults.username,
                  from:fromDate.toDateString(),
                  to:toDate.toDateString(),
                  count: limitDate,
                  log:logTable
                })
                res.json({
                  _id: logResults.id,
                  username: logResults.username,
                  to:fromDate.toDateString(),
                  count:j-1,
                  log:logTable
                })
            
              }else if(!from && !to && limitDate && Boolean(logResults)){
        
                  while (i<limitDate && i<logResults.log.length){
                    
                     const logElt=new Date(logResults.log[i].date)
                      logTable.push(logResults.log[i])
                     i=i+1
                  } 
                  console.log("seventh",{
                    _id: logResults.id,
                    username: logResults.username,
                    from:fromDate.toDateString(),
                    to:toDate.toDateString(),
                    count: limitDate,
                    log:logTable
                  })
                  res.json({
                    _id: logResults.id,
                    username: logResults.username,
                    from:fromDate.toDateString(),
                    count:i,
                    log:logTable
                  })
              
                }
    
    else {

      res.json({
        username: logResults.username,
        count: logResults.count,
        _id: logResults.id,
        log: logResults.log
      })
    }
    


  } catch (err) {
    res.send(err)
  } */


})

//connection to mongoose
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    const listener = app.listen(process.env.PORT || 3001, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })
  })
  .catch((err) => console.log(`${err}did not connect`));