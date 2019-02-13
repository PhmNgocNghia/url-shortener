import url from 'url';
import {
  getOriginUrlInfo,
  isShortenedUrlAvailable,
  saveGenerateUrl,
} from './lambda_utils/database';

exports.handler = async function(event, context, callback) {
  // helper
  const respond = ({ status = 200, body = {} }) => {
    callback(null, {
      statusCode: status,
      body: body ? JSON.stringify(body) : null,
    });
  };

  const body = JSON.parse(event.body);
  // handle ping
  if (body && body.ping) {
    respond({ body: { message: 'success' } });
    return;
  }
  // ensures url is present
  if (!body || !body.url) {
    respond({
      status: 400,
      body: { message: 'Invalid request' },
    });
    return;
  }

  try {
    await validateUrl(body.url);
    const originUrlInfo = await getOriginUrlInfo(body.url);
    console.log(originUrlInfo)
    if (originUrlInfo) {
      respond({
        body: { message: 'success', shortenedUrl: originUrlInfo.shortenedUrl },
      });
    } else {
      const shortenedUrl = await generateShortenedUrl();
      await saveGenerateUrl({
        originUrl: body.url,
        shortenedUrl,
      });
      respond({
        body: { message: 'success', shortenedUrl },
      });
    }
  } catch (e) {
    respond({ status: e.statusCode || 500, body: { message: e.message } });
  }
};

function validateUrl(longUrl) {
  return new Promise((resolve, reject) => {
    let err;
    if (!longUrl) {
      err = new Error('URL is required');
    }

    let parsedUrl = url.parse(longUrl);
    if (parsedUrl.protocol === null || parsedUrl.host === null) {
      err = new Error('URL is invalid');
    }

    if (err) {
      err.statusCode = 400;
      reject(err);
      return;
    }

    resolve(longUrl);
  });
}

function generateUrl(Url = '') {
  let characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let position = Math.floor(Math.random() * characters.length);
  let character = characters.charAt(position);
  if (Url.length === 7) {
    return Url;
  }
  return generateUrl(Url + character);
}

function generateShortenedUrl() {
  return new Promise(function(resolve) {
    let shortenedURL = generateUrl();
    isShortenedUrlAvailable(shortenedURL).then(function(isFree) {
      return isFree ? resolve(shortenedURL) : resolve(generateShortenedUrl());
    });
  });
}
