export const generateRandomString = (length) => {
  const charecters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = '';
  for (let i=0; i<length; i++){
    result += charecters.charAt(Math.floor(Math.random() * charecters.length));
  }
  return result;
}

export const generateRandomNumber = (length) => {
  const charecters = '0123456789';
  let result = '';
  for (let i=0; i<length; i++){
    result += charecters.charAt(Math.floor(Math.random() * charecters.length));
  }
  return result;
}