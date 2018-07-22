'use strict';
/* 
 * SYNC SHIFTS
 * -------------------------------------------------
 * Gets shifts roster data (shifts) from Deputy and 
 * syncs it with Setting Guidelines Shifts
 */
const config = require('config');
const shiftModel = require('./shiftModel');
const Shift = shiftModel.Shift;

/* 
 * Fetches roster data ("shifts") from deputy and returns a promise
 * Accepts Deputy query as argument https://www.deputy.com/api-doc/API/Resource_Calls#page_POST_resourceobjectQUERY
 */
exports.syncDeputy = async function(){

    let rosterQuery, rosterData;

    try{

        rosterQuery = config.get('deputy.roster.query');

        //Get the roster data from deputy
        rosterData = await shiftModel.getRosterData(rosterQuery);

    } catch(err) {

        throw new Error( err.message );

    }

    let deputyShifts = rosterData
        //Create new shift objects from the deputy roster data 
        .map( ( rosterDoc ) => shiftModel.rosterDocToShift(rosterDoc) )
        // Save the shift to the database
        .map( async (shift) => {

            try{
                await Shift.findOne( { deputyRosterId: shift.deputyRosterId }, function(err, existingShift){
                    
                    if(err) return new Error(err);
                    
                    //Check if shift already exists
                    if( existingShift ) {
                        shift = shift.toObject();
                        delete shift._id;
                        delete shift.isNew;
                        shift = Object.assign( existingShift, shift );
                    }

                    shift.save( function(err, savedShift){
                        if(err) return new Error(err);
                        shift = savedShift;
                    });

                })

                return shift;

            }catch(err){

                throw new Error(err); 

            }
        });

    return Promise.all(deputyShifts);;

};

