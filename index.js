import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import Messages from './dbmessages.js';
import Pusher from 'pusher';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT|| 5000;


const pusher = new Pusher({
    appId: "1209149",
    key: "a02fd6eacca6ba6bde5a",
    secret: "d560cbb4925bca3654a0",
    cluster: "eu",
    useTLS: true
  });


app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// app.use((req,res,next)=>{
//     res.setHeader("Access-Control-Allow-Origin","*");
//     res.setHeader("Access-Control-Allow-Headers","*");
//     next();
// });


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pjygh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex: true})

const db = mongoose.connection;

db.once('open',()=>{
    console.log('db connected successfully');

    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch();

    changeStream.on('change',(change)=>{
        // console.log("A change occured",change);

        if(change.operationType==='insert'){
          const messageDetails=change.fullDocument;
          pusher.trigger('messages','inserted',
          {
          name: messageDetails.name,
          message: messageDetails.message,
          timestamp: messageDetails.timestamp,
        //   recieved: messageDetails.recieved,
          email: messageDetails.email,
          });
        }else{
            console.log('Error triggering Pusher');
        }

    });
});

app.get('/', function (req, res) {
    res.status(200).send('hello world')
})

app.get('/messages/sync',(req,res)=>{

    const dbMessage = req.body;
    
    Messages.find(dbMessage, (err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})


app.post('/messages/new',(req,res)=>{
    const dbMessage = req.body;

    Messages.create(dbMessage, (err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(201).send(`new messages created: \n ${data}`)
        }
    })

})


app.listen(port,()=>console.log(`Listening to localhost: ${port}`))