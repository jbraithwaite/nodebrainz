var http = require('http');

module.exports = function(config, callback){

  var options = {
    host: config.host,
    path: config.path,
    headers: {
      'user-agent': config.userAgent
    },
    json: true
  };

  // Make the request
  http.get(options, function(res) {

    // Server did not like our request
    if (res.statusCode == 401) return callback({error:'Authorization required', statusCode:res.statusCode});
    else if (res.statusCode == 500) return callback({error:'Server side issue', statusCode:res.statusCode});
    else if (res.statusCode == 503) return callback({error:'Rate limited', statusCode:res.statusCode});
    else if (res.statusCode == 404) return callback({error:'Not Found', statusCode:res.statusCode});
    else if (res.statusCode != 200 && res.statusCode != 400) return callback({error:'Well that did not work', statusCode:res.statusCode});

    var data = '';
    var err;

    // Gather up all the data chunks
    res.on('data', function (chunk) {
      data += chunk;
    });

    // ... When they are all gathered
    res.on('end', function () {

      // ...parse the data as a JSON
      try {
        data = JSON.parse(data);
      } catch (e) {
        return callback({error:'Could not parse response as JSON'});
      }

      // 400 errors contain useful information
      if (res.statusCode == 400) {
        data.statusCode = res.statusCode;
        return callback(data);
      }

      // Should be good
      callback(err, data);
    });

  // Error on Request
  }).on('error', function(e) {
    callback(e);
  });
};
