const actions = require('./utils/constants');
const {decrypt} = require('./utils/helperFunctions');
const Transaction = require('./models/Transaction');
const Blockchain = require('./models/Blockchain');

const socketListeners = (socket, chain, doctorId, privateKey, addPatient, updateBreakFlag) => {
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
    console.info('End Mining encountered');
    updateBreakFlag(true);
    const blockchain = new Blockchain();
    blockchain.parseBlockchain(blocks);
    if (blockchain.validateChainIntegrity() && blockchain.blockchain.length >= chain.blockchain.length) {
      chain.blockchain = blockchain.blockchain;
      console.info('Chain replaced');
    }
    else{
      console.error('Invalid or outdated chain');
    }
  });

  socket.on(actions.REFERRAL, (encryptedData, patientId, referralId) => {
    console.info('Referral encountered');
    if(referralId == doctorId){
      const decryptedData = decrypt(encryptedData, privateKey);
      const parsedKey = JSON.parse(decryptedData);
      addPatient(patientId, {key: Buffer.from(parsedKey.key.data), iv: Buffer.from(parsedKey.iv.data)});
    }
  });

  return socket;
};

module.exports = socketListeners;