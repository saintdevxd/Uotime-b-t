const axios = require("axios");
const db = require("croxydb");
async function checkAndUpdateTime() {
    const links = await db.fetch(`uptime.links`);
    if (!links) return;
    for (const link of links) {
        try {
            await axios.get(link);
        } catch (error) {
            console.error(`Error checking link ${link}`);
        }
    }
}

module.exports = { checkAndUpdateTime }