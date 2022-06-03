const {Blockchain} = require('./Blockchain.js');
const {CentralAuthority} = require('./CentralAuth.js');
const {Client} = require('./Client.js');

const ehrBlockchain = new Blockchain();
const centralAuthority = new CentralAuthority(ehrBlockchain,"CA");
const client1 = new Client(centralAuthority, "d1", "Dr. Smith");
client1.addPatient("Patient1");