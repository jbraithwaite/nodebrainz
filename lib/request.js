"use strict";

const http = require('http');

module.exports = function(config, callback) {

  let options = {
    host: config.host,
    path: config.path,
    port: config.port,
    headers: {
      'user-agent': config.userAgent
    },
    json: true
  };

  // If you are looking to debug, this would be a great place to put:
  // console.log(options.path);

  // Make the request
  http.get(options, res => {

    // Server did not like our request because ...

    // Not authorized
    if (res.statusCode === 401) {
      return callback({error: 'Authorization required', statusCode:res.statusCode});
    }

    // A generic server error
    else if (res.statusCode === 500) {
      return callback({error: 'Server side issue', statusCode:res.statusCode});
    }

    // We are being rate limited
    else if (res.statusCode === 503) {
      return callback({error: 'Rate limited', statusCode:res.statusCode});
    }

    // It wasn't found
    else if (res.statusCode === 404) {
      return callback({error: 'Not Found', statusCode:res.statusCode});
    }

    // Some other reason
    else if (res.statusCode !== 200 && res.statusCode !== 400) {
      return callback({error: 'Well that didn\'t work...', statusCode:res.statusCode});
    }

    // Output data
    let data = '';

    // Gather up all the data chunks
    res.on('data', chunk => {
      data += chunk;
    });

    // ... When they are all gathered
    res.on('end', () => {

      // ... try to
      try {

        // ... parse the data as JSON
        data = JSON.parse(data);

        // ... catching any errors
      } catch (e) {
        return callback({error:'Could not parse response as JSON'});
      }

      // 400 errors contain useful information
      if (res.statusCode === 400) {
        data.statusCode = res.statusCode;
        return callback(data);
      }

      // Should be good, call the callback
      callback(null, data);
    });

  // Error on request
  }).on('error', e => callback(e));
};
