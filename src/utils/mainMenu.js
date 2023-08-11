import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import blessed from 'blessed';
import open from 'open';
import p from 'phin';
import config from './config.js';
import helpers from '../helpers/index.js';
import deleteAccount from './deleteAccount.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

function mainMenu() {
  const account = config.get('account');

  let listEmail = [];
  let selectedIndex = 0;
  let countInterval;

  const screen = blessed.screen({
    smartCSR: true,
    // autoPadding: true
  });

  const emailListElement = blessed.list({
    parent: screen,
    label: ' Inbox ',
    tags: true,
    width: '32%',
    height: '100%-3',
    top: 0,
    left: 0,
    border: 'line',
    keys: true,
    vi: true,
    mouse: true,
    style: {
      fg: 'white',
      selected: {
        fg: 'black',
        bg: 'cyan',
      },
      label: {
        fg: 'black',
        bg: 'white',
        bold: true,
      },
      focus: {
        bg: 'black',
      },
    },
  });
  screen.append(emailListElement);

  const emailBody = blessed.box({
    tags: true,
    border: { type: 'line' },
    style: {
      fg: 'white',
      focus: {
        bg: 'black',
      },
      label: {
        fg: 'black',
        bg: 'white',
        bold: 'true',
      },
    },
    width: '68%',
    height: '100%-3',
    top: 0,
    right: 0,
    mouse: true,
    keys: true,
    vi: true,
    alwaysScroll: true,
    scrollable: true,
    scrollbar: {
      style: {
        bg: 'white',
      },
    },
  });
  screen.append(emailBody);

  const information = blessed.box({
    label: `{white-fg}{bold}─┐ ${account.email}{/bold}{/white-fg}{|}{bold}{blue-fg}h{/blue-fg}elp - {red-fg}r{/red-fg}eset - {red-fg}q{/red-fg}uit {white-fg}┌─{/white-fg}{/bold}`,
    parent: screen,
    tags: true,
    width: '100%',
    height: 3,
    bottom: 0,
    left: 0,
    border: 'line',
    align: 'center',
  });
  screen.append(information);

  const helpMenu = blessed.box({
    width: '70%',
    height: '55%',
    top: 'center',
    left: 'center',
    border: 'line',
    hidden: true,
    content: 'This is a help guide for the main menu interface\nRun "dispmail --help" for CLI usage information.\n\n{bold}{magenta-bg}Key{/magenta-bg}{/bold}     {bold}{magenta-bg}Usage{/magenta-bg}{/bold}\n\n{bold}{white-bg}{black-fg}R{/black-fg}{/white-bg}{/bold}       Reset/delete account\n{bold}{white-bg}{black-fg}H{/black-fg}{/white-bg}{/bold}       Show help\n{bold}{white-bg}{black-fg}Q{/black-fg}{/white-bg}{/bold}       Quit Program\n{bold}{white-bg}{black-fg}Ctrl-O{/black-fg}{/white-bg}{/bold}  Open email in the browser\n\nPress {bold}{white-bg}{black-fg}ESC{/white-bg}{/black-fg}{/bold} to exit help',
    tags: true,
  });

  const counter = blessed.box({
    parent: emailListElement,
    tags: true,
    style: emailListElement.style,
    width: '95%',
    height: 1,
    bottom: 0,
    align: 'center',
  });
  emailListElement.append(counter);

  const confirmElement = blessed.box({
    width: '70%',
    height: 5,
    top: 'center',
    left: 'center',
    border: 'line',
    hidden: true,
    tags: true,
  });

  const fetchEmailList = async () => {
    try {
      const res = await p({
        url: `https://www.1secmail.com/api/v1/?action=getMessages&login=${account.username}&domain=${account.domain}`,
        parse: 'json',
      });
      listEmail = res.body;
    } catch (e) {
      // console.error("Error fetch email list", e.message);
      information.setContent(
        `{red-fg}Error fetch email list:{/red-fg} ${e.message}`,
      );
    }
  };

  const fetchEmailData = async (id) => {
    try {
      const res = await p({
        url: `https://www.1secmail.com/api/v1/?action=readMessage&login=${account.username}&domain=${account.domain}&id=${id}`,
        parse: 'json',
      });
      return res.body;
    } catch (e) {
      // console.error("Error fetch email", e.message);
      information.setContent(`{red-fg}Error fetch email:{/red-fg} ${e.message}`);
      return null;
    }
  };

  const renderEmailList = (listElement) => {
    listElement.clearItems();
    listEmail.forEach((email) => listElement.addItem(email.subject));
    listElement.select(selectedIndex);
    screen.render();
  };

  const renderEmailBody = (email) => {
    emailBody.setLabel(` ${email.subject} `);
    emailBody.setContent(email.textBody);
    information.setContent('Press {bold}Ctrl-O{/bold} to open in browser');
    screen.render();
  };

  function handleConfirm(choice) {
    if (choice === 'y' || choice === 'Y') {
      screen.destroy();
      deleteAccount();
    }
    screen.remove(confirmElement);
    screen.render();
  }

  function showConfirmElement() {
    screen.append(confirmElement);
    confirmElement.setContent('Do you want to delete the email?\n\nPress "y" for Yes or "n" for No.');
    confirmElement.show();
    confirmElement.focus();
    screen.render();
  }

  let count = 0;
  const updateCounter = () => {
    const remainingSeconds = 5 - (count % 5);
    counter.setContent(`Fetching in ${remainingSeconds}s...`);
    screen.render();
    count++;
  };

  emailListElement.on('select', () => {
    selectedIndex = emailListElement.selected;
    if (listEmail.length > 0) {
      const selectedEmail = listEmail[selectedIndex].id;
      fetchEmailData(selectedEmail)
        .then((emailData) => {
          if (emailData) {
            renderEmailBody(emailData);
            emailBody.focus();
          }
        })
        .catch((e) => information.setContent(`{red-fg}Error reading email data:{/red-fg} ${e.message}`));
    }
  });

  fetchEmailList()
    .then(async () => {
      renderEmailList(emailListElement);
      information.setContent(await helpers.copyToClipboard(account.email));
      countInterval = setInterval(updateCounter, 1000);

      setInterval(async () => {
        clearInterval(countInterval);
        fetchEmailList()
          .then(() => {
            renderEmailList(emailListElement);
            if (listEmail.length > 0) {
              const selectedEmail = listEmail[emailListElement.selected].id;
              fetchEmailData(selectedEmail)
                .then((emailData) => {
                  if (emailData) {
                    renderEmailBody(emailData);
                  }
                  countInterval = setInterval(updateCounter, 1000);
                })
                .catch((error) => {
                  information.setContent(`{red-fg}Error fetching email data:{/red-fg} ${error.message}`);
                  countInterval = setInterval(updateCounter, 1000);
                });
            } else {
              countInterval = setInterval(updateCounter, 1000);
            }
          })
          .catch((error) => {
            information.setContent(`{red-fg}Error fetch email list:{/red-fg} ${error.message}`);
            countInterval = setInterval(updateCounter, 1000);
          });
      }, 5000);
    })
    .catch((error) => information.setContent(`{red-fg}Error fetching email data:{/red-fg} ${error.message}`));

  emailBody.key('C-o', async () => {
    if (listEmail[selectedIndex] === undefined) {
      information.setContent('{red-fg}Email is empty{/red-fg}');
      return;
    }

    const selectedEmail = listEmail[selectedIndex].id;

    try {
      const result = await fetchEmailData(selectedEmail);
      await writeFile(
        path.join(dirname, '../../downloads/index.html'),
        result.htmlBody,
      );
      await open(path.join(dirname, '../../downloads/index.html'));
      information.setContent(path.join(dirname, '../../downloads/index.html'));
    } catch (e) {
      information.setContent(`{red-fg}Error downloading email:{/red-fg} ${e.message}`);
    }
  });

  helpMenu.key('escape', () => {
    helpMenu.hide();
  });

  confirmElement.key(['y', 'Y', 'n', 'N'], (ch) => handleConfirm(ch));

  screen.key(['h'], () => {
    screen.append(helpMenu);
    helpMenu.show();
    helpMenu.focus();
    screen.render();
  });

  screen.key(['r', 'R'], () => showConfirmElement());

  // screen.key('C-s', () => {
  //   screen.program.disableMouse();
  // });

  // screen.key('C-d', () => {
  //   screen.program.enableMouse();
  // });

  screen.key('left', () => {
    emailListElement.focus();
  });

  screen.key('right', () => {
    emailBody.focus();
  });

  screen.key(['q', 'C-c'], () => process.exit(0));

  screen.render();
}

export default mainMenu;
