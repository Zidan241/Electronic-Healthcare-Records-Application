const SHA256 = require("crypto-js/sha256");
const {getKey} = require('./PublicKeysStorage.js');
const {generateHash, verifySignature} = require('./HelperFunctions.js');

class Transaction {
  /**
   * @param {string} doctorId
   * @param {string} patienId
   * @param {Visit} visit
   */
  constructor(doctorId, patienId, visit) {
    this.doctorId = doctorId;
    this.patienId = patienId;
    this.visit = visit;
    this.timestamp = Date.now();
  }

  /**
   * @returns {string}
   */
  calculateHash() {
    return generateHash(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
  }

  /**
   * @param {string} signingKey
   */
  signTransaction(signingKey) {
    // You can only send a transaction from the wallet that is linked to your
    // key. So here we check if the fromAddress matches your publicKey
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }
    

    // Calculate the hash of this transaction, sign it with the key
    // and store it inside the transaction object
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');

    this.signature = sig.toDER('hex');
  }

  /**
   * Checks if the signature is valid (transaction has not been tampered with).
   * It uses the fromAddress as the public key.
   *
   * @returns {boolean}
   */
  isValid() {
    // If the transaction doesn't have a from address we assume it's a
    // mining reward and that it's valid. You could verify this in a
    // different way (special field for instance)
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

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
  }
  /**
   * @returns {string}
   */
  generateHash(){
    return generateHash(this.index + this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce);
  }
  /**
  * @param {number} difficulty
  */
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
  /**
   * @returns {boolean}
   */
  hasValidTransactions() {
    for (const t of this.transactions) {
      if (!t.isValid())
        return false;
    }
    return true;
  }
}
class Blockchain{
  /**
  * @param {number} difficulty
  * @param {number} bufferLimit
  */
  constructor(difficulty, bufferLimit){
      this.blockchain = [this.createGenesisBlock()];
      this.transactionBuffer = [];
      this.bufferLimit = bufferLimit;
      this.difficulty = difficulty;
      console.log("Blockchain created");
  }
  /**
   * @returns {Block}
   */
  createGenesisBlock(){
    return new Block(0,Date.parse('2017-01-01'), [], '0');
  }
  /**
   * @returns {Block}
   */ 
  getLatestBlock(){
      return this.blockchain[this.blockchain.length - 1];
  }
  addNewTransaction(transactionData, signature, senderId){
    //get sender public key
    const senderPublicKey = getKey(senderId);
    //verify signature
    if(verifySignature(transactionData, signature, senderPublicKey)){
        //add transaction to buffer
        this.transactionsBuffer.push(decryptedData);
        this.addNewBlockCheck();
        console.log("Transaction added");
        //verification successful
        return true;
    }
    //verification failed
    console.log("Verification failed");
    return false;
  }
  addNewBlockCheck(){
    //if there are more than the bufferLimit transactions in the buffer, create a new block
    if(this.transactionsBuffer.length >= bufferLimit){
        this.addNewBlock();
    }
  }
  addNewBlock(){
    if(this.transactionsBuffer.length > 0){
      const newBlock = new Block(this.blockchain.getLatestBlock().index + 1, new Date(), this.transactionsBuffer, this.blockchain.getLatestBlock().hash);
      newBlock.mineBlock(this.difficulty);
      debug('Block successfully mined!');
      this.blockchain.push(newBlock);
      this.transactionsBuffer = [];
    } else{
      console.log("No transactions in buffer");
    }
  }
  // testing the integrity of the chain
  validateChainIntegrity(){
      for(let i = 1; i<this.blockchain.length; i++){
          const currentBlock = this.blockchain[i];
          const previousBlock = this.blockchain[i-1];
          if(currentBlock.hash !== currentBlock.generateHash()){
              return false;
          }
          if(currentBlock.previousHash !== previousBlock.hash){
              return false;
          }
      }
      console.log("Chain integrity verified");
      return true;
  }
}
function checkDifficulty(difficulty, hash) {
  return hash.substr(0, difficulty) === "0".repeat(difficulty)
}
function updateHash(block) {
  return { ...block, hash: block.generateHash()}
}
function nextNonce(block) {
  return updateHash({ ...block, nonce: block.nonce + 1 })
}
function trampoline(func) {
  let result = func.apply(func, ...arguments);
  while(result && typeof(result) === "function") {
    result = result();
  }
  return result;
}
function mineBlock(difficulty, block) {
  function mine(block) {
    const newBlock = nextNonce(block);
    return checkDifficulty(difficulty, newBlock.hash)
            ? newBlock
            : () => mine(nextNonce(block));
  }
  return trampoline(mine(nextNonce(block)));
}
exports.Block = Block;
exports.Blockchain = Blockchain;