const {verifySignature, generateSignature, encryptSymmetric} = require('../utils/helperFunctions.js');
const {getKey} = require('../db/publicKeysStorage.js');

class Transaction {
    /**
     * @param {string} doctorId
     * @param {string} patientId
     * @param {Object} data
     * @param {string} referralId
     */
    constructor(doctorId, patientId, data, referralId) {
      this.doctorId = doctorId;
      this.patientId = patientId;
      this.data = data;
      this.timestamp = Date.now();
      this.referralId = referralId;
    };

    /**
     * 
     */
    updateTransaction(previousTransaction, previousAllowedDoctors) {
      this.previousTransaction = previousTransaction;
      this.allowedDoctors = previousAllowedDoctors;
    };

    /**
     * @param {string} symetricKey
     */
    encryptData(symetricKey, iv) {
      this.data = encryptSymmetric(JSON.stringify(this.data), symetricKey, iv);
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
      const { doctorId, referralId, patientId, data, timestamp} = this;
      return JSON.stringify({
        doctorId,
        referralId,
        patientId,
        data,
        timestamp
      });
    };

    parseTransaction(transaction) {
      this.doctorId = transaction.doctorId;
      this.referralId = transaction.referralId;
      this.patientId = transaction.patientId;
      this.data = transaction.data;
      this.timestamp = transaction.timestamp;
      this.signature = transaction.signature;
      this.previousTransaction = transaction.previousTransaction;
    };
};

module.exports = Transaction;