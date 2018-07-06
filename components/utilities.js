const moment = require('moment');
const debug = require('debug')('utilities')



function getRangeOverlap(startA, endA, startB, endB){
    //Determine if they overlap using DeMorgans' Law

    try{

        if( !(endA <= startB || startA >= endB) ) {
            //They overlap
            let w, x, y, z;
            
            w = endA - startA;
            x = endA - startB;
            y = endB - startB;
            z = endB - startA; 
            
            return Math.min(w,x,y,x);
        }
        
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




module.exports = {
    getRangeOverlap,
    getDuration
}