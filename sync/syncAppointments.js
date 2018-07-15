'use strict';
/* 
 * SYNC APPOINTMENTS
 * -------------------------------------------------
 * Gets appointment data from KM Sales App (FoxPro)  and 
 * syncs it with Setting Guidelines appointments
 */
const config = require('config');
const axios = require('axios');
const log = require('debug')('log');

const Slot = require('../components/appointment/slot/slot');
const Appointment = require('../components/appointment/appointment');

async function getKMAppointments(){
    
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

function createAppointment(document){
    return new Appointment({
        kmid: document.kmid, // Number
        name: { // Object
            first: document.name.first, // String
            last: document.name.last // String
        },
        phone: document.phone, // String
        email: document.email, // String
        address: {
            street: document.address.street, // String
            city: document.address.city, // String
            state: document.address.state, // String
            zipCode: document.address.zipCode //Number
        },
        date: document.date, // Date
        setBy: document.setBy, // String
        setDate: document.detDate, // Date
        confirmedBy: document.confirmedBy, // String
        confirmedDate: document.confirmedDate, //Date
        assignedTo: document.assignedTo, // String
        region: document.region, // Number
        notes: document.notes // String
    });
}

module.exports = async function(){

    try{
        // Get all appointment slots
        const slots = await Slot.find();
        let appointments = await getKMAppointments();
        appointments = appointments.map( appointment => createAppointment(appointment) );

        log(appointments);

    }catch(err){
        throw new Error(err);
    }
    
}