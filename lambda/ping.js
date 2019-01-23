exports.handler = async function(event, context, callback) {
  // helper
  const respond = ({ status = 200, body = {} }) => {
    callback(null, {
      statusCode: status,
      body: body ? JSON.stringify(body) : null,
    });
  };

  respond({ body: { message: 'success' } });
};
