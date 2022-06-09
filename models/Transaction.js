const {verifySignature, generateSignature, encryptSymmetric} = require('../utils/helperFunctions.js');
const {getKey} = require('../db/publicKeysStorage.js');

class Transaction {
    /**
     * @param {string} doctorId
     * @param {string} patientId
     * @param {Object} data
     */
    constructor(doctorId, patientId, data) {
      this.doctorId = doctorId;
      this.patientId = patientId;
      this.data = data;
      this.timestamp = Date.now();
    };

    /**
     * @param {string} symetricKey
     */
    encryptData(symetricKey) {
      this.data = encryptSymmetric(JSON.stringify(this.data), symetricKey);
    };

    /**
     * @param {string} privateKey
     */
    signTransaction(privateKey) {
      this.signature = generateSignature(this.getDetails(), privateKey);
    };
  
    /**
     * @returns {boolean}
     */
    isValid() {
      if (!this.signature || this.signature.length === 0) {
        return false;
      }
      return verifySignature(this.getDetails(), this.signature, getKey(this.doctorId));
    };

    getDetails() {
      const { doctorId, patientId, data, timestamp} = this;
      return (
        doctorId+
        patientId+
        data+
        timestamp
      );
    };
};

module.exports = Transaction;