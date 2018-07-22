const moment = require('moment');
const debug = require('debug')('utilities')
const RRule = require('rrule').RRule;


function getDuration(xDateTime, yDateTime){

    xDateTime = moment(xDateTime);
    yDateTime = moment(yDateTime);

    if( !xDateTime.isValid() || !yDateTime.isValid() )
    throw new Error('Not a valid moment.')
    
    return moment.duration( xDateTime.diff(yDateTime) );

}

function handleError(error){
    return new Error(error.message);
}





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

const rrule = {
    
    getAllDates: function(rrule){
        let rule = rrule;
        try{
            if(typeof rrule === "string") rule = RRule.fromString(rrule);
            return rule.all();
        }catch(error){
            throw new Error(error);
        }
    }

}








module.exports = {
    getRangeOverlap,
    getDuration,
    handleError,
    getRelevantSlots,
    rrule
}