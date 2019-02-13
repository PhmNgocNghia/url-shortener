const AWS = require('aws-sdk');

AWS.config = new AWS.Config({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

const docClient = new AWS.DynamoDB.DocumentClient();

export function saveGenerateUrl({ originUrl, shortenedUrl }) {
  return new Promise((resolve, reject) => {
    docClient.put(
      {
        TableName: 'redirects',
        Item: {
          shortenedUrl,
          originUrl,
        },
      },
      function(err, data) {
        if (err) {
          reject(err);
        }

        resolve(data);
      },
    );
  });
}

export function getOriginUrlInfo(originUrl) {
  return new Promise((resolve, reject) => {
    docClient.query(
      {
        TableName: 'redirects',
        ProjectionExpression: 'originUrl, shortenedUrl',
        KeyConditionExpression: 'originUrl = :originUrl',
        ExpressionAttributeValues: {
          ':originUrl': originUrl,
        },
      },
      function(err, data) {
        if (err) {
          reject(err);
        }

        if (data.Count === 0) resolve(null);
        resolve(data.Items[0]);
      },
    );
  });
}

export function getShortenedUrlInfo(shortenedUrl) {
  return new Promise((resolve, reject) => {
    docClient.query(
      {
        TableName: 'redirects',
        IndexName: 'shortenedUrl-index',
        ProjectionExpression: 'originUrl, shortenedUrl',
        KeyConditionExpression: 'shortenedUrl = :shortenedUrl',
        ExpressionAttributeValues: {
          ':shortenedUrl': shortenedUrl,
        },
      },
      function(err, data) {
        if (err) {
          reject(err);
        }

        if (data.Count === 0) resolve(null);
        resolve(data.Items[0]);
      },
    );
  });
}

export function isShortenedUrlAvailable(shortenedUrl) {
  return new Promise((resolve, reject) => {
    docClient.query(
      {
        TableName: 'redirects',
        ProjectionExpression: 'id',
        IndexName: 'shortenedUrl-index',
        KeyConditionExpression: 'shortenedUrl = :shortenedUrl',
        ExpressionAttributeValues: {
          ':shortenedUrl': shortenedUrl,
        },
      },
      function(err, data) {
        if (err) {
          console.log(err);
          reject(err);
        }

        if (data.Count === 0) resolve(true);
        resolve(false);
      },
    );
  });
}
