const axios = require('axios');
const Slot = require('../components/appointment/slot/slot');
const config = require('config');


const debug = require('debug');
let log = debug('log');
log.log = console.log.bind(console);

async function getKMAppointments(){
    "use strict";
    
    try{
        
        const options = {
            method:'get',
            url: config.get('api.appointments.url'),
            json: true,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/json'
            }
        };
        
        let response,
            appointments = [];

        do{
            //Send the api call
            response = await axios(options);

            //Add the returned roster documents to the allRosterData array
            appointments = appointments.concat(response.data);
            
        }
        //Get more records if the previous fetch hit the max number documents. Eg. the query limit  
        while( appointments.length < 200 );  
        
        log('Appointments Returned: ', appointments.length);

        return appointments;

    } catch(err) {
        throw new Error(err);
    }
}


module.exports = async function(){

    try{
        // Get all appointment slots
        const slots = await Slot.find();
        const appointments = await getKMAppointments();


    }catch(err){
        throw new Error(err);
    }
    
}