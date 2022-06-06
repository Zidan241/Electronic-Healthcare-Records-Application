const {getKey} = require('./PublicKeysStorage.js');
const {encrypt, generateHash, verifySignature, generateSignature} = require('./HelperFunctions.js');
const { Patient } = require('./Patient.js');

class Visit {
  /**
   * @param {string} bloodPressure
   * @param {string} pulse
   * @param {string} temperature
   */
   constructor(bloodPressure, pulse, temperature) {
    this.bloodPressure = bloodPressure;
    this.pulse = pulse;
    this.temperature = temperature;
  };
};

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

class Blockchain{
  /**
  * @param {number} difficulty
  */
  constructor(difficulty){
      this.blockchain = [this.createGenesisBlock()];
      this.transactionBuffer = [];
      this.difficulty = difficulty;
      console.log("Blockchain created");
  }
  /**
   * @returns {Block}
   */
  createGenesisBlock(){
    return new Block(0,Date.parse('2017-01-01'), [], '0');
  };

  /**
   * @returns {Block}
   */ 
  getLatestBlock(){
      return this.blockchain[this.blockchain.length - 1];
  };

  /**
   * @param {Transaction} transaction
   */
  addTransaction(transaction){
    if(transaction.isValid()){
        //find patient's last visit
        let transactions = this.getTransactions(transaction.patientId, transaction.doctorId);
        if(transactions.length > 0){
            let lastTransaction = transactions[transactions.length - 1];
            transaction.previousHash = lastTransaction.hash;
        }else{
          //no previous visit
          if(transaction.patient==null){
            throw new Error("No patient general info");
          }else{
            transaction.previousHash = '0';
          }
        }
        //add transaction to buffer
        this.transactionBuffer.push(transaction);
        console.log("Transaction added");
    }else{
      //verification failed
      throw new Error('Invalid transaction');
    }
  };

  async mineBlock(){
    if(this.transactionBuffer.length > 0){
      const newBlock = new Block(this.getLatestBlock().index + 1, new Date(), this.transactionBuffer, this.getLatestBlock().hash);
      newBlock.mineBlock(this.difficulty);
      console.log('Block successfully mined!');
      this.blockchain.push(newBlock);
      this.transactionBuffer = [];
    } else{
      console.log("No transactions in buffer");
    }
  };

  /**
   * @returns {boolean}
   * @param {string} doctorId
   * @param {string} patientId
   * @returns {string} all encrypted visits for a patient and a doctor
    */
  getTransactions(patientId, doctorId){
    if(!this.validateChainIntegrity()){
      throw new Error("Chain integrity compromised");
    }
    let transactions = [];
    for(let i = 0; i < this.blockchain.length; i++){
      for(let j = 0; j < this.blockchain[i].transactions.length; j++){
        if(this.blockchain[i].transactions[j].patientId === patientId && this.blockchain[i].transactions[j].doctorId === doctorId){
          transactions.push(this.blockchain[i].transactions[j]);
        }
      }
    }
    //validate transactions integrity using the previous hash
    for(let i = 1; i < transactions.length; i++){
      const currentTransaction = transactions[i];
      const previousTransaction = transactions[i - 1];
      if(currentTransaction.previousHash !== previousTransaction.hash){
        throw new Error("Visits integrity compromised");
      }
      if(currentTransaction.hash !== currentTransaction.generateHash()){
        throw new Error("Visits integrity compromised");
      }
    }
    return transactions;
  };

  
  /**
   * @returns {boolean}
   */
  validateChainIntegrity(){
    // Check if the Genesis block is valid
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.blockchain[0])) {
      return false;
    }
    for(let i = 1; i<this.blockchain.length; i++){
        const currentBlock = this.blockchain[i];
        const previousBlock = this.blockchain[i-1];
        if(currentBlock.hash !== currentBlock.generateHash()){
          return false;
        }
        if(currentBlock.previousHash !== previousBlock.hash){
          return false;
        }
        if (!currentBlock.hasValidTransactions()) {
          return false;
        }
      }
      return true;
  };
}

exports.Blockchain = Blockchain;
exports.Transaction = Transaction;
exports.Visit = Visit;