const fs = require('fs');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);

const maxRetries = 5;
const retryDelay = 500;

async function retryUnlink(filePath, retries = maxRetries) {
  try {
    await unlinkAsync(filePath);
  } catch (err) {
    if (err.code === 'EBUSY' && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return retryUnlink(filePath, retries - 1);
    }
    throw err;
  }
}

module.exports = { retryUnlink };