const actions = require('./utils/constants');
const {decrypt} = require('./utils/helperFunctions');
const Transaction = require('./models/Transaction');
const Blockchain = require('./models/Blockchain');

const socketListeners = (socket, chain, doctorId, privateKey, patients) => {
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
    process.env.BREAK = true;
    const blockchain = new Blockchain();
    blockchain.parseBlockchain(blocks);
    console.log(chain);
    if (blockchain.validateChainIntegrity() && blockchain.blockchain.length >= chain.blockchain.length) {
      chain.blockchain = blockchain.blockChain;
    }
    else{
      console.log('Invalid chain');
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