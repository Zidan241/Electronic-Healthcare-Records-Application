const Block = require('./Block.js');
const Transaction = require('./Transaction.js');
const actions = require('../utils/constants');

class Blockchain {
  /**
   * @param {number} difficulty
   * @param {number} bufferLimit
   */
  constructor(difficulty, bufferLimit, io) {
    this.blockchain = [this.createGenesisBlock()];
    // list of transactions that are yet to mined to a block
    this.transactionBuffer = [];
    this.difficulty = difficulty;
    this.bufferLimit = bufferLimit;
    this.nodes = [];
    this.io = io;
    console.log("Blockchain created");
  }
  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(0, Date.parse("2017-01-01"), [], "0");
  }

  /**
   * @returns {Block}
   */
  getLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  /**
   * @param {number} node
   */
  addNode(node) {
    this.nodes.push(node);
  }

  /**
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (transaction.isValid()) {
      //TODO: check if this docotor is allowed to add a transaction for this patient

      //update block
      //add transaction to buffer
      this.transactionBuffer.push(transaction);
      console.log("Transaction added");
      //check if buffer is full
      if (this.transactionBuffer.length >= this.bufferLimit) {
        console.info("Starting mining block...");
        process.env.BREAK = false;
        this.transactionBuffer = [];
        this.mineBlock();
      }
    } else {
      //verification failed
      throw new Error("Invalid transaction");
    }
  }

  async mineBlock() {
    const newBlock = new Block(
      this.getLatestBlock().index + 1,
      new Date(),
      this.transactionBuffer,
      this.getLatestBlock().hash
    );
    const breakFlag = await newBlock.mineBlock(this.difficulty);
    if (breakFlag != "true") {
      this.blockchain.push(newBlock);
      console.log("Block successfully mined!");
      this.io.emit(actions.END_MINING, this.toArray());
    }
  }

  /**
   * @returns {boolean}
   * @param {string} doctorId
   * @param {string} patientId
   * @returns {string} all encrypted transactions for a patient and a doctor
   */
  getTransactions(patientId, doctorId) {
    if (!this.validateChainIntegrity()) {
      throw new Error("Chain integrity compromised");
    }
    let transactions = [];
    for (let i = 0; i < this.blockchain.length; i++) {
      for (let j = 0; j < this.blockchain[i].transactions.length; j++) {
        if (
          this.blockchain[i].transactions[j].patientId === patientId &&
          this.blockchain[i].transactions[j].doctorId === doctorId
        ) {
          transactions.push(this.blockchain[i].transactions[j]);
        }
      }
    }
    //validate transactions integrity using the previous hash
    for (let i = 1; i < transactions.length; i++) {
      const currentTransaction = transactions[i];
      const previousTransaction = transactions[i - 1];
      if (currentTransaction.previousHash !== previousTransaction.hash) {
        throw new Error("Transactions integrity compromised");
      }
      if (currentTransaction.hash !== currentTransaction.generateHash()) {
        throw new Error("Transactions integrity compromised");
      }
    }
    return transactions;
  }

  /**
   * @returns {boolean}
   */
  validateChainIntegrity() {
    // Check if the Genesis block is valid
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.blockchain[0])) {
      return false;
    }
    for (let i = 1; i < this.blockchain.length; i++) {
      const currentBlock = this.blockchain[i];
      const previousBlock = this.blockchain[i - 1];
      if (currentBlock.hash !== currentBlock.generateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
    }
    return true;
  };

  toArray() {
    return this.blockchain.map(block => block.getDetails());
  };

  parseChain(blocks) {
    this.blockchain = blocks.map(block => {
      const parsedBlock = new Block(0);
      parsedBlock.parseBlock(block);
      return parsedBlock;
    });
  }
}

module.exports = Blockchain;