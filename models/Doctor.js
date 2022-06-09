const {addKey, getLength} = require('../db/publicKeysStorage.js');
const {generateKeyPair,decrypt} = require('../utils/helperFunctions.js');
const Patient = require('./Patient.js');
const Visit = require('./Visit.js');
const {Transaction} = require('./Transaction.js');
const {generateKeyPair} = require('./utils/helperFunctions');
const { v4: uuidv4 } = require('uuid');

class Doctor{
    constructor(){
        this.id = `doc-${getLength()}`;
        const {publicKey,privateKey} = generateKeyPair();
        addKey(publicKey, id);
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    };

    /**
     * @param {Patient} patient
     * @param {String} intialBloodPressure
     * @param {String} intialPulse
     * @param {String} intialTemperature
     * @returns {Transaction}
     */
    addPatient(data){
        const {name, age, weight, height, gender, bloodPressure, pulse, temperature} = body;
        if(!name||!age||!weight||!height||!gender||!bloodPressure||!pulse||!temperature){
            return null;
        }
        const transaction = new Transaction(this.id, uuidv4() , body);
        transaction.signTransaction(this.privateKey);
        return transaction;
    };

    /**
     * @param {string} patientId
     * @param {String} bloodPressure
     * @param {String} pulse
     * @param {String} temperature
     * @returns {Transaction}
     */
    createVisit(patientId, bloodPressure, pulse, temperature){
        if(!patientId) throw new Error('No patientId');
        if(!bloodPressure || bloodPressure.length==0) throw new Error('No blood pressure');
        if(!pulse || pulse.length==0) throw new Error('No pulse');
        if(!temperature || temperature.length==0) throw new Error('No temperature');
        const visit = new Visit(bloodPressure, pulse, temperature);
        const transaction = new Transaction(this.id, patientId, visit, null);
        transaction.signTransaction(this.privateKey);
        return transaction;
    }
    decrptTransactions(transactions){
        try{
            return transactions.map(transaction => ({...transaction,visit:JSON.parse(decrypt(transaction.visit, this.privateKey))}));
        }
        catch(e){
            console.log(e);
            throw new Error('Could not decrypt visits');
        }
    }

}

module.exports = Doctor;