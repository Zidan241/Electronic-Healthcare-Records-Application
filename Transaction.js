const {Patient} = require('./Patient.js');
const {Visit} = require('./Visit.js');
const {encrypt, generateHash, verifySignature, generateSignature} = require('./HelperFunctions.js');
const {getKey} = require('./PublicKeysStorage.js');

class Transaction {
    /**
     * @param {string} doctorId
     * @param {string} patientId
     * @param {Visit} visit
     * @param {Patient} patient
     */
    constructor(doctorId, patientId, visit, patient) {
      this.doctorId = doctorId;
      this.patientId = patientId;
      this.visit = encrypt(JSON.stringify(visit), getKey(doctorId));
      this.timestamp = Date.now();
      this.patient = patient;
      this.hash = this.generateHash();
    };
  
    generateHash(){
      return generateHash(this.doctorId + this.patientId + this.visit + this.timestamp + this.patient);
    };
  
    /**
     * @param {string} privateKey
     */
    signTransaction(privateKey) {
      if(!privateKey) throw new Error('No private key');
      this.signature = generateSignature((this.doctorId + this.patientId + this.visit + this.timestamp + this.patient), privateKey);
    };
  
    /**
     * @returns {boolean}
     */
    isValid() {
      if (!this.signature || this.signature.length === 0) {
        throw new Error('No signature in this transaction');
      }
      return verifySignature((this.doctorId + this.patientId + this.visit + this.timestamp + this.patient), this.signature, getKey(this.doctorId));
    };
};
exports.Transaction = Transaction;