/* eslint-disable no-console */
import clipboard from 'clipboardy';
import getDomain from '../utils/getDomain.js';

const usernameValidator = async (input) => {
  if (/^[a-zA-Z0-9]+$/g.test(input)) {
    return true;
  }

  throw Error('Seng nggenah po lek nggawe username ki.');
};

const fetchDomain = async () => {
  const domain = await getDomain();

  if (domain.status === 'failed') {
    console.error('✖', domain.message);
    return ['exit'];
  }

  return domain.data;
};

const copyToClipboard = async (email) => {
  try {
    await clipboard.write(email);
    return 'Email automatically copied to clipboard';
  } catch (error) {
    return `Here is your email: ${email}`;
  }
};

const helpers = {
  usernameValidator,
  fetchDomain,
  copyToClipboard,
};

export default helpers;
