import inquirer from 'inquirer';
import MaxLengthInputPrompt from 'inquirer-maxlength-input-prompt';
import createAccount from './utils/createAccount.js';
import mainMenu from './utils/mainMenu.js';
import helpers from './helpers/index.js';
import config from './utils/config.js';

inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);

async function initMenu() {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      message: 'Do you want to generate email quickly?',
      name: 'quick',
      default: true,
    },
    {
      type: 'maxlength-input',
      message: 'Pick an username',
      name: 'username',
      maxLength: '18',
      when(answers) {
        return !answers.quick;
      },
      validate: (input) => helpers.usernameValidator(input),
    },
    {
      type: 'list',
      message: 'Choose the domain',
      name: 'domain',
      choices: async () => helpers.fetchDomain(),
      when(answers) {
        return !answers.quick;
      },
    },
  ]);

  if (answer.domain === 'exit') return;

  createAccount(answer);
}

function next() {
  const isLogged = config.get('isLogged');
  if (isLogged) {
    mainMenu();
  } else {
    initMenu();
  }
}

export default next;
