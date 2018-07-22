const mongoose = require('mongoose');
const RRule = require('rrule').RRule;
const config = require('config');
const moment = require('moment');

const eventSchema = new mongoose.Schema({
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: Date,
    title: String,
    isRecurring: {
        type: Boolean,
        default: false
    },
    regionName: String,
    regionNumber: Number,
    rrule: String,
    originalStartDateTime: Date,
    orignialEndDateTime: Date,
    parentId: mongoose.Schema.Types.ObjectId
},{
    timestamps:true
})


class EventClass {

    get duration(){
        if(this.endDateTime) return (this.endDateTime - this.startDateTime)/60000;
        return null;
    }

}


eventSchema.loadClass(EventClass);

eventSchema.pre('save', async function(next){

    // sets originalStartDateTime
    if( !this.originalStartDateTime ) this.originalStartDateTime = this.startDateTime;

    // sets originalEndDateTime
    if( !this.orignialEndDateTime & this.endDateTime ) this.orignialEndDateTime = this.endDateTime;

    if( this.isNew && this.isRecurring ){

        const scheduleWindowEnd = moment().add( config.get('scheduleWindowSize'), 'days').toDate();

        const rrule = RRule.fromString(this.rrule);

        const dates = rrule.between(new Date(), scheduleWindowEnd);

        const newEvents = createRecurringEvents(this, dates);

        if(newEvents){
            let results = await Event.create(newEvents, err => { console.log(err) });
        }

    } 

    next();

})

const Event = mongoose.model('Event', eventSchema);
exports.Event = Event;




/*
 * Business Logic
 */

function createRecurringEvents( parentEvent, dateTimeArray ) {
    
    try{
        
        const rrule = RRule.fromString(parentEvent.rrule);

        if( !rrule || parentEvent.constructor.name != "model") return;
        
        dateTimeArray = dateTimeArray || rrule.all();
        
        let parentEventObj = parentEvent.toObject();
        delete parentEventObj._id;
        delete parentEventObj.isRecurring;
        delete parentEventObj.rrule;

        const events = dateTimeArray.map( dateTime => {

            let eventObj = Object.assign({}, parentEventObj);
            eventObj.startDateTime = eventObj.originalStartDateTime = dateTime;
            eventObj.endDateTime = eventObj.orignialEndDateTime = parentEvent.endDateTime ? (dateTime + (parentEvent.endDateTime - parentEvent.startDateTime) ) : null;
            
            const event = new Event(eventObj);

            return event;

        });
        
        return events;

    }catch(err){
        throw new Error(err);
    }


}

exports.createRecurringEvents = createRecurringEvents;



// NOTE: Needs to be fixed
// Expected Functionality: updates recurring event and future instances of that recurring event
exports.updateRecurringEvents = async function(parentEvent, callback){

    // Check if the recurring event already exists
    await Event.findById(parentEvent._id, async (err, event)=>{
        if(err) throw new Error(err);
        if(!event) return;
        
    })


    if(callback) callback();

    return ;
}




exports.forwardFillRecurringSlots = async function(){

    try{
        const scheduleWindowEnd = moment().startOf('day').add( config.get('scheduleWindowSize') ,'days');
        // Get all recurring slots
        const recurringSlots = await Slot.find({isRecurring: true}, (err) => { if(err) throw new Error(err); });

        // Determine which recurring slots have instances within
        // the current scheduling window (scheduling window is typically 
        // the next 30 days)
        const newSlots = recurringSlots.filter( (recurringSlot) => {
            
            if(!recurringSlot.rrule) return false;

            // Utility to find if rule has instances within date range
            const rrule = RRule.fromString(recurringSlot.rrule);

            const dates = rrule.between(new Date(), scheduleWindowEnd.toDate());

            return (dates.length > 0);
        })

        return newSlots;

        // Create missing recurring slots instances to fill scheduling window 
    } catch(err){

        throw new Error(err);
        
    }
}