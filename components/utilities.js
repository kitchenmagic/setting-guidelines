const moment = require('moment');
const debug = require('debug')('utilities')


// Determines if the two date ranges overlap using DeMorgans' Law and returns the overlap
function getRangeOverlap(startA, endA, startB, endB){
    
    try{

        //Check if they overlap
        if( !(endA <= startB || startA >= endB) ) {

            let w, x, y, z;
            
            w = endA - startA;
            x = endA - startB;
            y = endB - startB;
            z = endB - startA; 

            return Math.min(w,x,y,x);
        }

        // Else return 0
        return 0;

    }catch(err){
        throw new Error(err.message);
    }

}


function getDuration(xDateTime, yDateTime){

    xDateTime = moment(xDateTime);
    yDateTime = moment(yDateTime);

    if( !xDateTime.isValid() || !yDateTime.isValid() )
    throw new Error('Not a valid moment.')
    
    return moment.duration( xDateTime.diff(yDateTime) );

}

function handleError(error){
    return (function(){ throw new Error(error.message); }());
}


//returns array of slots which overlap the given startDateTime and endDateTime
function getRelevantSlots(startDateTime, endDateTime, slots){
    
    // Convert parameters to moments
    startDateTime = moment(startDateTime);
    endDateTime = moment(endDateTime);
    
    // Check if parameters are valid moment objects 
    if(!(startDateTime.isValid() & endDateTime.isValid() ) )
        throw new Error("Invalid Argument: startDateTime or endDateTime are not valid date objects");

    if(!slots)
        throw new Error("Invalid Argument: Missing Slots")

    // console.log("All Slots", slots);

    //Try to get the relevant slots for the provided dateTime range
    try {


        let appSlots = slots
            
            .map( slot => { let a = slot.toObject(); return a; } )
            
            // Filters out slots that don't apply to start day of week 
            .filter( (slot) => slot.daysOfWeek.indexOf( startDateTime.day() ) > -1 ) 

            // Fitler out slots where the shift doesn't meet the minumum overlap requirements
            .filter( (slot) => {

                // Slots have no context, they only apply to days of the week and times
                // Use the date of the input for the date of the slot
                const slotStart = startDateTime.startOf('day').add(slot.start.hour,'hours').add(slot.start.minute, 'minutes');
                const slotEnd = endDateTime.startOf('day').add(slot.end.hour,'hours').add(slot.end.minute, 'minutes');

                // Convert overlap from milliseconds to minutes 
                const minutesOverlap = getRangeOverlap(startDateTime, endDateTime, slotStart, slotEnd) / 60000; 

                slot.overlap = minutesOverlap;
                slot.overlapPerc = (slot.overlap/slot.duration) * 100;

                return minutesOverlap > 0; // Replace "0" with minimum overlap requirements. 
                // Is minumum overlap based on fixed number, percentage or both?
            }).map((slot)=> { const id = slot._id; return id;} );

            return appSlots;

    } catch( err ) {
        throw new Error( err ); 
    }
}











module.exports = {
    getRangeOverlap,
    getDuration,
    handleError,
    getRelevantSlots
}