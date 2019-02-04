import { getShortenedUrlInfo } from '../lambda_utils/database';

exports.handler = async function(event, context, callback) {
  // helper
  const respond = ({ status = 200, body = {} }) => {
    callback(null, {
      statusCode: status,
      body: body ? JSON.stringify(body) : null,
    });
  };

  const shortenedUrl = event.queryStringParameters.shortenedurl;
  if (!shortenedUrl) {
    respond({
      status: 400,
      body: { message: 'Invalid request' },
    });
    return;
  }

  try {
    const shortenedUrlInfo = await getShortenedUrlInfo(shortenedUrl);
    if (shortenedUrlInfo) {
      callback(null, {
        statusCode: 301,
        headers: {
          Location: shortenedUrlInfo.originUrl,
        },
      });
    } else {
      respond({
        body: { message: 'not found' },
        status: 404,
      });
    }
  } catch (e) {
    respond({ status: e.statusCode || 500, body: { message: e.message } });
  }
};
