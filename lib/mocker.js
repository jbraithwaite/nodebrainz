"use strict";

// We don't actually want to make real http requests, this fakes it for us.
let mockRequest = function(config, callback){

  if (this.mock.mock503) {
    return callback({error: 'Rate limited', statusCode:503});
  }

  callback(null,{response:'faked'}) ;
};

module.exports.mockRequest = mockRequest;