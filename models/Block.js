const Transaction = require('./Transaction.js');
const {generateHash} = require('../utils/helperFunctions.js');

class Block{

    /**
     * @param {number} index
     * @param {Date} timestamp
     * @param {Transaction[]} transactions
     * @param {string} previousHash
     * @param {number} nonce
     */
    constructor(index, timestamp, transactions, previousHash, nonce) {
      this.index = index;
      this.timestamp = timestamp;
      this.transactions = transactions;
      this.previousHash = previousHash;
      this.hash = this.generateHash();
      this.nonce = nonce;
    };

    /**
     * @returns {string}
     */
    generateHash(){
      return generateHash(this.index + this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce);
    };

    /**
    * @param {number} difficulty
    * @returns {Promise<boolean>}
    */
    mineBlock(difficulty) {
      new Promise((resolve) => { setImmediate(async()=>{
        const END_MINING = process.env.END_MINING;
        let proofCheck = this.hash.substring(0, difficulty) !== "0".repeat(difficulty);
        if(proofCheck || END_MINING == 'true'){
          resolve(END_MINING);
        }else{
          this.nonce++;
          this.hash = this.generateHash();
          resolve(this.mineBlock(difficulty));
        }
      })});
    };
    /**
     * @returns {boolean}
     */
    hasValidTransactions() {
      for (const t of this.transactions) {
        if (!t.isValid())
          return false;
      }
      return true;
    };
};

module.exports = Block;