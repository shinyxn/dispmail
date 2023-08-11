import fs from 'fs';
import Conf from 'conf';

// import packageJSON from '../package.json' assert {type: 'json'}
const packageJSON = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'),
);

const schema = {
  isLogged: {
    type: 'boolean',
    default: false,
  },
  account: {
    type: 'object',
    properties: {
      accountType: {
        type: 'integer',
        default: 1,
      },
    },
  },
};

const config = new Conf({
  projectName: packageJSON.name,
  clearInvalidConfig: true,
  schema,
});

export default config;
