const bcrypt = require('bcrypt');

const generateSalt = async (saltRounds = 10) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return salt;
  } catch (error) {
    console.error('Error generating salt:', error);
    return null;
  }
};

module.exports = generateSalt;