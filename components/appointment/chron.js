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

const Appointment = require('../components/appointment/appointment');

async function getAppointmentData(){
    
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
            appointmentData = [];

        do{
            //Send the api call
            response = await axios(options);

            //Add the returned roster documents to the allRosterData array
            appointmentData = appointmentData.concat(response.data);
            
        }
        //Get more records if the previous fetch hit the max number documents. Eg. the query limit  
        while( appointmentData.length < 100 );  

        return appointmentData;

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
        start: document.date, // Date
        setBy: document.setBy, // String
        setDate: document.detDate, // Date
        confirmedBy: document.confirmedBy, // String
        confirmedDate: document.confirmedDate, //Date
        assignedTo: document.assignedTo, // String
        region: document.region, // Number
        notes: document.notes // String
    });
}

exports.sync = async function(){
    let appointments;
    
    try{
        appointments = await getAppointmentData();
    }catch(err){
        throw new Error(err);
    }

    appointments = appointments.map( async appointmentDoc => {

        try{
            let appointment = createAppointment(appointmentDoc);
        
            await Appointment.findOne( { kmid: appointment.kmid }, function(error, existingAppointment){
                
                // Return the error if ther is one
                if(error) throw new Error(err);

                if(existingAppointment){
                    appointment = appointment.toObject();
                    delete appointment._id;
                    delete appointment.isNew;
                    appointment = Object.assign(existingAppointment, appointment);
                }

                appointment.save( function(err, savedAppointment){
                    if(err) throw new Error(err.message);
                    appointment = savedAppointment;
                })

            })
        
            return appointment;

        }catch(err){
            throw new Error(err.message);
        }

    });

    return Promise.all(appointments);

    
}

exports.getSomethign = function(){}