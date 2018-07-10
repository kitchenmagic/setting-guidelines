const mongoose = require('mongoose');
const config = require('config');
const log = require('debug')('slots');
const moment = require('moment');
let slots;

let db;

mongoose.connect(config.get('mongoDB.path'))
    .then( () => {
        log('Connected to MongoDB...');
        db = mongoose.connection;
    })
    .catch( err => { throw new Error( err.message ) } );


// Define the Slot schema
const schema = new mongoose.Schema({
    start: {
        hour: {
            type: Number,
            required: true,
            min: 0,
            max: 23
        },
        minute:{
            type: Number,
            min: 0,
            max: 59,
            default: 0
        }
    },
    end:{
        hour: {
            type: Number,
            required: true,
            min: 0,
            max: 23
        },
        minute:{
            type: Number,
            min: 0,
            max: 59,
            default: 0
        }
    },
    duration: {
        type: Number
    },
    daysOfWeek: {
        type: [Number],
        min: 0,
        max: 6
    }
        
})

// Create the Slot model
const Model = mongoose.model('Slot', schema);


// Creates a slot in the database
async function createSlot(slot){
    try{
        slot = new Model(slot);
        return await slot.save();
    }catch(err){
        throw new Error( err.message );
    }
}

async function getSlots(query ,callback){
    console.log('Get Slots');

    try{
        const results = await Model.find(query, callback);
        return results;
    }catch(err){
        throw new Error( err.message );
    }

}

console.log('how many times has this run', slots);

//returns array of slots which overlap the given startDateTime and endDateTime
async function getRelevantSlots(startDateTime, endDateTime){
    
    // Convert parameters to moments
    startDateTime = moment(startDateTime);
    endDateTime = moment(endDateTime);
    
    // Check if parameters are valid moment objects 
    // if(!(startDateTime.isValid() & endDateTime.isValid() ) )
    //     return
    
    console.log('Slots inside getRelevantSlots', slots);
    if(!slots){
        
        slots = await getSlots()
        foo();
        console.log('True');

    } else {
        foo();
    }

    
    function foo(){

        try {
            console.log('Foo');

            return slots
                
                // Filters out slots that don't apply to start day of week 
                .filter( (slot) => slot.dayOfWeek.indexOf( startDateTime.day() ) > -1 ) 
    
                // Fitler out slots where the shift doesn't meet the minumum overlap requirements
                .filter( (slot) => {
    
                    // Slots have no context, they only apply to days of the week and times
                    // Use the date of the input for the date of the slot
                    const slotStart = startDateTime.startOf('day').add(slot.start.hour,'hours').add(slot.start.minute, 'minutes');
                    const slotEnd = endDateTime.startOf('day').add(slot.end.hour,'hours').add(slot.end.minute, 'minutes');
    
                    // Convert overlap from milliseconds to minutes 
                    const minutesOverlap = utilities.getRangeOverlap(startDateTime, endDateTime, slotStart, slotEnd) / 60000; 
    
                    slot.overlap = minutesOverlap;
                    slot.overlapPerc = (slot.overlap/slot.duration) * 100;
    
                    return minutesOverlap > 0; // Replace "0" with minimum overlap requirements. 
                    // Is minumum overlap based on fixed number, percentage or both?
                })

        } catch( err ) {
            throw new Error( err ); 
        }
    }    
}


module.exports = {
    Model,
    schema,
    createSlot,
    getSlots,
    getRelevantSlots
}