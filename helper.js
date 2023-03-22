
// helper function to lookup user by email
const getUserByEmail = function (email, users) {
  for (const user of Object.values(users)) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = () => {
  const length = 6;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

module.exports = { getUserByEmail, generateRandomString };