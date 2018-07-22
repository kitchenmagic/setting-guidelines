const config = require('config');
const AppointmentSlot = require('./appointmentSlot');
const moment = require('moment');
const RRule = require('rrule').RRule;

const schedulingWindowSize = config.get('schedulingWindowSize');




async function createRecurringEvents(parentEvent, callback){

    try{

        // Create new instances for the next x days out
        const rule = RRule.fromString(parentEvent.rrule);
        
        if(!rule.options.until) rule.options.until = moment().add(schedulingWindowSize,'days');
        
        const dates = rule.all();
        
        const appointmentSlots = dates.map( (date)=>{
            return new AppointmentSlot({
                startDateTime: date,
                parentId: parentEvent._id
            });
        });
        
        let result = await AppointmentSlot.create(appointmentSlots, (err) => { 
            if(err) throw new Error(err);
        })
    
        if(callback) callback(result);
    
        return result;

    }catch(err){

        throw new Error(err);

    }

}


async function updateRecurringEvents(parentEvent, callback){

    // Check if the recurring event already exists
    await AppointmentSlot.findById(parentEvent._id, async (err, appointmentSlot)=>{
        if(err) throw new Error(err);
        if(!appointmentSlot) return;

        // if it exists, find and delete all future instances of it
        await AppointmentSlot.deleteMany({parentId: parentEvent._id, startDateTime: {$gt}}, (err2)=>{
            if(err2) throw new Error(err2);
        })
    })
    

    if(callback) callback();

    return ;
}



// update appointment slots
async function updatePendingAppointmentSlots(){
    
    const schedulingWindowEnd = moment().startOf('day').add(schedulingWindowSize, 'days');
    
    // get all recurring appointment slots
    const recurringApptSlots = await AppointmentSlot.find( {isRecurring:true}, (err) => { if(err) throw new Error(err); })


    const pendingApptSlots = recurringApptSlots.filter( (apptSlot) => {

        // Find which of the recurring appointment slots need to be created
        const rrule = RRule.fromString(apptSlot.rrule);

        if(!rrule.options.until & !rrule.options.count) rrule.options.until = schedulingWindowEnd;

        const apptSlotDates = rrule.all();

        apptSlotDates.filter( date => date >= moment() & date <= schedulingWindowEnd )
        
        apptSlotDates;
    })

    // create new appointment slots to fill in the gaps



}


function createRecurring() {
    if(!this.rrule) return;

    try{
        let rule = RRule.fromString(parentSlot.rrule);
        const dates = rule.all();
        // let appointmentSlots = 

    }catch(error){
        throw new Error(error);
    }

    return appointmentSlots;
};

function createPendingRecurring(){
    let a = updatePendingAppointmentSlots();
}