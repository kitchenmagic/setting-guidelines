const axios = require('axios');
const config = require('config');
const mongoose = require('mongoose');
const shifts = require('../components/shifts/shifts');
const Shift = shifts.Shift;

mongoose.connect(config.get('mongoDB.path'));


function parseRegionNumber(regionName){
    if(regionName.search(/Region/i) >= 0) {
        return parseInt(regionName.substr(-(regionName.length - 6)).trim());
    }
    return null;
}


function createShiftsFromRosterData(rosterData){
    "use strict";

    const newShifts = [];

    for( let key in rosterData){

        let currShift = rosterData[key];

        const newShift = new Shift({
            deputyRosterId: currShift.Id,
            startDateTime: currShift.StartTimeLocalized,
            endDateTime: currShift.EndTimeLocalized,
            regionName: currShift._DPMetaData.OperationalUnitInfo.OperationalUnitName,
            regionNumber: parseRegionNumber(currShift._DPMetaData.OperationalUnitInfo.OperationalUnitName),
            employeeId: currShift._DPMetaData.OperationalUnitInfo.Id
        });

        newShifts.push(newShift);
    }

    return newShifts;
    
}



//Fetches roster data ("shifts") from deputy returns a promise
async function getRosterData(query){
    "use strict";

    const postOptions = 
    {
        method:'POST',
        url: config.get('deputy.roster.path') + 'QUERY',
        json: true,
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            authorization: "OAuth " + config.get('deputy.authToken')
        },
        data: query || config.get('deputy.roster.query')
    };

    try{

        const response = await axios(postOptions); 
        return response.data;

    } catch(err) {

        throw new Error(err);

    }



}



async function syncWithDeputy(){

    const rosterData = await getRosterData();
    const shiftsArray = createShiftsFromRosterData(rosterData);
    shifts.insertShifts(shiftsArray, function(error, docs){
        console.log(docs);
    });

}

syncWithDeputy();