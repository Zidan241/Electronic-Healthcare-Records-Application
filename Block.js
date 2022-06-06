const {Transaction} = require('./Transaction.js');
const {generateHash} = require('./HelperFunctions.js');

class Block{
    /**
     * @param {number} index
     * @param {number} timestamp
     * @param {Transaction[]} transactions
     * @param {string} previousHash
     */
    constructor(index, timestamp, transactions, previousHash){
      this.index = index;
      this.timestamp = timestamp;
      this.transactions = transactions;
      this.previousHash = previousHash;
      this.hash = this.generateHash();
      this.patients = [];
      this.nonce = 0;
      console.log("Block created");
    };
    /**
     * @returns {string}
     */
    generateHash(){
      return generateHash(this.index + this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce);
    };
    /**
    * @param {number} difficulty
    */
    mineBlock(difficulty) {
      while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
        this.nonce++;
        this.hash = this.generateHash();
      }
      console.log(`Block mined: ${this.hash}`);
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

exports.Block = Block;