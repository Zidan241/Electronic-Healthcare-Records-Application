const {addKey} = require('./PublicKeysStorage.js');
const {Visit, Transaction} = require('./Blockchain.js');
const {generateKeyPair,decrypt} = require('./HelperFunctions.js');
const { Patient } = require('./Patient.js');

class Doctor{
    constructor(id, name){
        const {publicKey,privateKey} = generateKeyPair();
        addKey(publicKey, id);
        this.id = id;
        this.name = name;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        console.log("Doctor created");
    };

    /**
     * @param {Patient} patient
     * @param {String} intialBloodPressure
     * @param {String} intialPulse
     * @param {String} intialTemperature
     * @returns {Transaction}
     */
    addPatient(patient, intialBloodPressure, intialPulse, intialTemperature){
        if(!patient) throw new Error('No patient');
        if(!intialBloodPressure || intialBloodPressure.length==0) throw new Error('No initial blood pressure');
        if(!intialPulse || intialPulse.length==0) throw new Error('No initial pulse');
        if(!intialTemperature || intialTemperature.length==0) throw new Error('No initial temperature');
        const visit = new Visit(intialBloodPressure, intialPulse, intialTemperature);
        const transaction = new Transaction(this.id, patient.id, visit, patient);
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

exports.Doctor = Doctor;