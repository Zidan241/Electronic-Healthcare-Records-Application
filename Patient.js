class Patient{
    /**
     * @param {string} id
     * @param {String} name
     * @param {String} age
     * @param {String} weight
     * @param {String} height
     * @param {String} gender
     */
    constructor(id, name, age, weight, height, gender){
        this.id = id;
        this.name = name;
        this.age = age;
        this.weight = weight;
        this.height = height;
        this.gender = gender;
        console.log("Patient created");
    };
}

exports.Patient = Patient;