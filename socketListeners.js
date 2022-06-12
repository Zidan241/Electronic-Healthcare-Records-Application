const actions = require('./utils/constants');
const {decrypt} = require('./utils/helperFunctions');
const Transaction = require('./models/Transaction');
const Blockchain = require('./models/Blockchain');

const socketListeners = (socket, chain, doctorId, privateKey, patients, updateBreakFlag) => {
  socket.on(actions.ADD_TRANSACTION, (transaction) => {
    try{
      const tx = new Transaction();
      tx.parseTransaction(transaction);
      chain.addTransaction(tx);
      console.info(`Added transaction for patient ${tx.patientId}`);
    }
    catch(err){
      console.error(err);
    }
  });

  socket.on(actions.END_MINING, (blocks) => {
    console.log('End Mining encountered');
    updateBreakFlag(true);
    console.log(blocks[1]);
    const blockchain = new Blockchain();
    blockchain.parseBlockchain(blocks);
    console.log(blockchain.blockchain[1]);
    if (blockchain.validateChainIntegrity() && blockchain.blockchain.length >= chain.blockchain.length) {
      chain.blockchain = blockchain.blockChain;
      console.info('Chain replaced');
    }
    else{
      console.log('Invalid or outdated chain');
    }
  });

  socket.on(actions.REFERRAL, (encryptedData, patientId, referralId) => {
    console.log('Referral encountered');
    if(referralId == doctorId){
      const decryptedData = decrypt(encryptedData, privateKey);
      const key = JSON.parse(decryptedData);
      patients[patientId] = key;
    }
  });

  return socket;
};

module.exports = socketListeners;