const axios = require("axios");
async function CheckURL(url) {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

module.exports = { CheckURL }