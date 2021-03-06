const app = require('express')();
const bodyParser = require('body-parser');
const httpServer = require('http').Server(app);
const axios = require('axios');
const io = require('socket.io')(httpServer);
const client = require('socket.io-client');
const Blockchain = require('./models/Blockchain');
const Transaction = require('./models/Transaction');
const actions  = require('./utils/constants');
const socketListeners = require('./socketListeners');
var portfinder = require('portfinder');
const {generateKeyPair, generateSymmetricKey, encrypt, decryptSymmetric} = require('./utils/helperFunctions');
const {addKey, getLength, getKey} = require('./db/publicKeysStorage');
const { v4: uuidv4 } = require('uuid');

portfinder.getPort(function (err, PORT) {
    var breakFlag = false;
    function updateBreakFlag(flag){
        breakFlag = flag;
    };
    async function getBreakFlag(){
        return breakFlag;
    };

    const blockchain = new Blockchain(4, 2, io, getBreakFlag, updateBreakFlag);
    const patients = {};
    function addPatient(patientId, key){
        patients[patientId] = key;
    }
    const doctorId = `doc-${getLength()}`;
    const {publicKey, privateKey} = generateKeyPair();
    addKey(publicKey, doctorId);

    app.use(bodyParser.json());

    app.post('/nodes', (req, res) => {
        const { host, port } = req.body;
        const { callback } = req.query;
        const node = `http://${host}:${port}`;
        const socketNode = socketListeners(client(node), blockchain, doctorId, privateKey, addPatient, updateBreakFlag);
        blockchain.addNode(socketNode);
        if (callback === 'true') {
            console.info(`Added node ${node} back`);
            res.json({ status: 'Added node Back' }).end();
        } else {
            axios.post(`${node}/nodes?callback=true`, {
                host: req.hostname,
                port: PORT,
            });
            console.info(`Added node ${node}`);
            res.json({ status: 'Added node' }).end();
        }
    });

    app.post('/addPatient', (req, res) => {
        const {name, age, weight, height, gender, bloodPressure, pulse, temperature} = req.body;
        if(!name||!age||!weight||!height||!gender||!bloodPressure||!pulse||!temperature){
            return res.status(400).json({error:"missing requirements"});
        }
        const patientId = uuidv4();
        const patientKey = generateSymmetricKey();
        patients[patientId] = patientKey;
        const tx = new Transaction(doctorId, patientId, req.body,null);
        tx.encryptData(patientKey.key, patientKey.iv);
        tx.signTransaction(privateKey);
        io.emit(actions.ADD_TRANSACTION, tx);
        res.json({ message: 'transaction success' }).end();
    });

    app.post('/newVisit/:patientId', (req, res) => {
        const {patientId} = req.params;
        const { bloodPressure, pulse, temperature, reason, medications, diagnosis, referral } = req.body;
        if(!bloodPressure || !pulse || !temperature || !reason || !medications || !diagnosis){
            return res.status(400).json({error:"missing requirements"});
        }
        const patientKey = patients[patientId];
        if(!patientKey){
            return res.status(400).json({error:"patient not found"});
        }
        const tx = new Transaction(doctorId, patientId, req.body, referral);
        tx.encryptData(patientKey.key, patientKey.iv);
        tx.signTransaction(privateKey);
        if(referral){
            const referralPublicKey = getKey(referral);
            if(!referralPublicKey){
                return res.status(400).json({error:"invalid referral"});
            }
            io.emit(actions.REFERRAL, encrypt(JSON.stringify(patientKey), referralPublicKey), patientId, referral);
        }
        io.emit(actions.ADD_TRANSACTION, tx);
        res.json({ message: 'transaction success' }).end();
    });

    app.get('/chain', (req, res) => {
        res.json(blockchain.blockchain).end();
    });

    app.get('/chain/:patientId', (req, res) => {
        //get all transactions for patient
        const {patientId} = req.params;
        const txs = blockchain.getTransactions(patientId);
        //decrypt transactions
        const decryptedTxs = txs.map(tx => {
            const {data} = tx;
            const {key, iv} = patients[patientId];
            return {
                ...tx,
                data: JSON.parse(decryptSymmetric(data, key, iv))
            }
        });
        res.json(decryptedTxs).end();
    });

    io.on('connection', (socket) => {
        console.info(`Socket connected, ID: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`Socket disconnected, ID: ${socket.id}`);
        });
    });

    blockchain.addNode(socketListeners(client(`http://localhost:${PORT}`), blockchain, doctorId, privateKey, addPatient, updateBreakFlag));

    httpServer.listen(PORT, () =>{
        console.info(`Server started on port ${PORT}`);
    });
});