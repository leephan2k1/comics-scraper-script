const fs = require('fs').promises;
import path from 'path';
import { format } from 'date-fns';

const fileName = path.join(__dirname, '../logs', 'server.log');
const logEvents = async (msg: string) => {
    const dateTimes = `${format(new Date(), 'dd-MM-YYY\tHH:mm:ss')}`;
    const contentLog = `${dateTimes} --- ${msg}\n`;

    try {
        fs.appendFile(fileName, contentLog);
    } catch (e) {
        console.error(e);
    }
};

export default logEvents;
