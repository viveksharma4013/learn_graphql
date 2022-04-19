import express from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose from 'mongoose';

import Event from './models/events.js';
import User from './models/user.js';
import bcryptjs from 'bcryptjs';

const app=express();

app.use(bodyParser.json());

app.use('/graphql',graphqlHTTP({
    schema:buildSchema(`
    type Event{
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
    }
    input EventInput{
        title: String!
        description: String!
        price: Float!
        date: String!
    }
    type User{
        _id: ID!
        email: String!
        password: String!
    }
    input UserInput{
        email: String!
        password: String!

    }
    type RootQuery{
        events: [Event!]!
    }
    type RootMutation{
        createEvent(eventInput:EventInput): Event
        createUser(userInput: UserInput): User
    }
    schema{
        query: RootQuery
        mutation: RootMutation
    }
    `),   //match the path to schema
    rootValue:{
        events:()=>{
            return Event.find().then((events)=>{
                return events.map((event)=>{
                    return {...event._doc,_id:event.id};
                });
            }).catch((err)=>{
                throw err;
            })
        },
        createEvent:(args)=>{
            const event=new Event({
                title:args.eventInput.title,
                description:args.eventInput.description,
                price:+args.eventInput.price,
                date:new Date(args.eventInput.date),
                creator:'625eadf61ddf28ff15a2840d'
            });
            let createdEvent;
            return event.save().then((result)=>{
                createdEvent = {...result._doc,_id:event.id};
                return User.findOne({_id:'625eadf61ddf28ff15a2840d'});
            }).then((user)=>{
                if(!user){
                    throw new Error('User does not exist');
                }
                user.createdEvents.push(event);
                return user.save();
            }).then(()=>{
                return createdEvent;
            })
            .catch((err)=>{
                console.log(err);
                throw err;
            }); 
        },
        createUser:(args)=>{
            return bcryptjs.hash(args.userInput.password,12).then((hashedPassword)=>{
                const user=new User({
                    email:args.userInput.email,
                    password:hashedPassword
                });
                return user.save().then((result)=>{
                    return {...result._doc, _id:result._id};
                }).catch((err)=>{
                    console.log(err);
                    if(err.code===11000) throw new Error('User already exists');
                    throw err;
                })
            }).catch((err)=>{
                console.log(err);
                throw err;
            })

        }
    },//match to resolver
    graphiql:true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.bb8rw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(()=>{
    app.listen(3000,()=>{
        console.log("h")
    });
}).catch((err)=>{
    console.log(err)
})

