const mongoose = require('mongoose');
const RRule = require('rrule').RRule;

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
    rrule: String,
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



eventSchema.methods.createEventInstances = function(parentEvent){

    if(!parentEvent.rrule) return;

    try{
        let rule = parentEvent.rrule;
        if(typeof rule === "string") rule = RRule.fromString(rule);

        let dates = rule.all();

    }catch(error){
        throw new Error(error);
    }


}


const Event = mongoose.model('Event', eventSchema);


module.exports = Event;