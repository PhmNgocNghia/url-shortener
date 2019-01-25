const url = require('url');
const AWS = require('aws-sdk');

AWS.config = new AWS.Config({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

const config = {
  BUCKET: process.env.AWS_S3_BUCKET,
  REGION: process.env.AWS_S3_REGION,
};

const s3Bucket = new AWS.S3({
  params: { Bucket: config.BUCKET },
});

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
    const path = await getPath();
    const redirect = buildRedirect(path, body.url);
    await saveRedirect(s3Bucket, redirect);
    respond({
      body: { message: 'success', shortenedUrl: getShortenedUrl(path) },
    });
  } catch (e) {
    respond({ status: e.statusCode || 500, body: { message: e.message } });
  }
};

function getShortenedUrl(objectPath = '') {
  const { BUCKET: bucket, REGION: region } = config;
  const baseUrl = `http://${bucket}.s3-website-${region}.amazonaws.com`;
  return baseUrl + '/' + objectPath;
}

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

function generatePath(path = '') {
  let characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let position = Math.floor(Math.random() * characters.length);
  let character = characters.charAt(position);
  if (path.length === 7) {
    return path;
  }
  return generatePath(path + character);
}

function buildRedirect(path, longUrl) {
  let redirect = {
    Bucket: config.BUCKET,
    Key: path,
  };
  if (longUrl) {
    redirect['WebsiteRedirectLocation'] = longUrl;
  }
  return redirect;
}

function saveRedirect(bucket, redirect) {
  return new Promise((resolve, reject) => {
    bucket.putObject(redirect, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(redirect);
    });
  });
}

function isPathFree(path) {
  return s3Bucket
    .headObject(buildRedirect(path))
    .promise()
    .then(() => Promise.resolve(false))
    .catch(function(err) {
      if (err.code === 'NotFound') {
        return Promise.resolve(true);
      } else {
        return Promise.reject(err);
      }
    });
}

function getPath() {
  return new Promise(function(resolve, reject) {
    let path = generatePath();
    isPathFree(path).then(function(isFree) {
      return isFree ? resolve(path) : resolve(getPath());
    });
  });
}
