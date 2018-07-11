const mongoose = require('mongoose');
const shiftsModule = require('../shifts/shifts')
const slotsModule = require('../slots/slots')


const schema = new mongoose.Schema({
    region: Number,
    slot: slotsModule.schema,
    shifts: [ shiftsModule.schema ],
    appointments: [ String ],
    availability: Number
})


const Model = mongoose.model('Availability', schema);



async function create(document){

    try{

        if(document.constructor.name !== 'model')
            document = new Model(document);

        return await document.save();

    } catch(err){

        throw new Error(err.message);

    }

}


//Updates a document or inserts one if it doesn't exist
async function upsert(query, document, options, callback){

    options = options || { runValidators:true, new: true }
    
    options.upsert = true;

    return await update( query, document, options, callback )

}



// Updates shifts in database
async function update(query, document, options, callback){

    options = options || {new:true, runValidators:true };

    try {

        if( document.constructor.name === 'model' ){
            document = document.toObject();
            delete document._id; // Delete the Shift's auto-generated id created by mongoose to aviod issues
        }

        if(!options.overwrite)
             document = { $set: document }

        return Model.findOneAndUpdate(query, document, options, callback);

    } catch(err) {

        throw new Error( err.message );

    }
}



//Hooks
// Model.on()





module.exports = {
    schema,
    model,
    create,
    upsert,
    update
}