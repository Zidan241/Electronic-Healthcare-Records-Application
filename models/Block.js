const Transaction = require('./Transaction.js');
const {generateHash} = require('../utils/helperFunctions.js');

class Block {
  /**
   * @param {number} index
   * @param {Date} timestamp
   * @param {Transaction[]} transactions
   * @param {string} previousHash
   * @param {string} hash
   * @param {number} nonce
   */
  constructor(index, timestamp, transactions, previousHash, hash, nonce) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = hash ? hash : this.generateHash();
  }

  /**
   * @returns {string}
   */
  generateHash() {
    return generateHash(this.getDetails());
  };

  /**
   * @returns {boolean}
   */
  hasValidTransactions() {
    for (const t of this.transactions) {
      if (!t.isValid()) return false;
    }
    return true;
  };

  getDetails() {
    const { index, timestamp, transactions, previousHash, nonce} = this;
    return JSON.stringify({
      index,
      timestamp,
      transactions,
      previousHash,
      nonce
    });
  };

  parseBlock(block) {
    this.index = block.index;
    this.timestamp = new Date(block.timestamp);
    this.hash = block.hash;
    this.previousHash = block.previousHash;
    this.nonce = block.nonce;
    this.transactions = block.transactions.map((transaction) => {
      const parsedTransaction = new Transaction();
      parsedTransaction.parseTransaction(transaction);
      return parsedTransaction;
    });
  };
};

module.exports = Block;