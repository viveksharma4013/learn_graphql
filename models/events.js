import mongoose from "mongoose";

const schema= mongoose.Schema;

const eventSchema=new schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    creator:{
            type : schema.Types.ObjectId,
            ref : 'User'
        }
});

var Event= mongoose.model('Event',eventSchema);
export default Event;