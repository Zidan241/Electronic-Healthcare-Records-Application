const { Blockchain } = require("./Blockchain.js");
const { Doctor } = require("./Doctor.js");
const { Patient } = require("./Patient.js");

try{
    //difficulty of 4
    const ehrBlockchain = new Blockchain(4);

    // doctors and patients creation
    const doctor1 = new Doctor("d1", "Dr. Smith");
    const doctor2 = new Doctor("d2", "Dr. Jones");
    const patient1 = new Patient("p1", "John", "30", "70", "170", "M");
    const tx1 = doctor1.addPatient(patient1, "120/80", "80", "37.5");
    ehrBlockchain.addTransaction(tx1);
    const patient2 = new Patient("p2", "Jane", "25", "60", "160", "F");
    const tx2 = doctor2.addPatient(patient2, "120/80", "80", "37.5");
    ehrBlockchain.addTransaction(tx2);

    ehrBlockchain.mineBlock();

    const tx3 = doctor1.createVisit(patient1.id, "120/80", "80", "37.5");
    ehrBlockchain.addTransaction(tx3);

    const tx4 = doctor2.createVisit(patient2.id, "120/80", "80", "37.5");
    ehrBlockchain.addTransaction(tx4);

    ehrBlockchain.mineBlock();

    var doctor1Visits = ehrBlockchain.getTransactions(patient1.id, doctor1.id);
    doctor1Visits = doctor1.decrptTransactions(doctor1Visits);
    console.log(doctor1Visits);

    console.log(
    "Blockchain valid?",
    ehrBlockchain.validateChainIntegrity() ? "Yes" : "No"
    );
}
catch(e){
    console.log(e);
}
