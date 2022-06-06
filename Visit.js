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

exports.Visit = Visit;