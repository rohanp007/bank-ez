const axios = require('axios');



const FRAUD_DETECTION_URL = 'http://127.0.0.1:5000/predict-fraud';

async function checkFraud(transactionData) {
    try {
        const response = await axios.post(FRAUD_DETECTION_URL, transactionData, { timeout: 5000 });
        return response.data; // Contains is_fraud and fraud_probability
    } catch (error) {
        console.error('Error connecting to fraud detection service:', error.message);
        throw new Error('Fraud detection service is unavailable.');
    }
}

module.exports = { checkFraud };