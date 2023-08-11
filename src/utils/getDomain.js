import p from 'phin';

export default async function getDomain() {
  try {
    const res = await p({
      url: 'https://www.1secmail.com/api/v1/?action=getDomainList',
      parse: 'json',
    });

    if (res.body.length === 0) {
      return {
        status: 'failed',
        message: 'Empty domain list',
      };
    }

    return {
      status: 'success',
      data: res.body,
    };
  } catch (error) {
    return {
      status: 'failed',
      message: error.message,
    };
  }
}
