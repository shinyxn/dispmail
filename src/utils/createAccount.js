import p from 'phin';
import ora from 'ora';
import config from './config.js';
import mainMenu from './mainMenu.js';

export default async function createAccount(data, openMainMenu = true) {
  const spinner = ora({
    color: 'green',
    spinner: 'dots12',
  });

  if (!data.quick) {
    spinner.start('Creating account');

    const email = `${data.username.toLowerCase()}@${data.domain}`;
    const accountData = { ...data, email };

    config.set({
      isLogged: true,
      account: accountData,
    });

    setTimeout(async () => {
      spinner.succeed('Account created successfully');
      if (openMainMenu) {
        mainMenu();
      }
    }, 3000);
  } else {
    spinner.start('Generating account');

    try {
      const result = await p({
        url: 'https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1',
        parse: 'json',
      });

      const email = result.body[0];

      const [username, domain] = email.split('@');
      const accountData = { ...data };
      accountData.email = email;
      accountData.username = username;
      accountData.domain = domain;

      config.set({
        isLogged: true,
        account: accountData,
      });

      spinner.succeed('Account created successfully');

      if (openMainMenu) {
        mainMenu();
      }
    } catch (e) {
      spinner.fail('Error occurred while creating account');
      // console.error(e)
    }
  }
}
