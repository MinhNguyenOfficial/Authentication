const base64url = (string) => {
  return btoa(string).replace(/\+/, '-').replace(/\//, '-').replace(/\=/, '');
};

module.exports = { base64url };
