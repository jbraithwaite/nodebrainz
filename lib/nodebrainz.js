var querystring = require('querystring');
var http = require('http');

var VERSION = '0.1.0';
var MB_HOST = 'musicbrainz.org';
var MB_BASE = '/ws/2/';

var _limit = 25;
var _userAgent = 'nodebrains/' + VERSION + ' (+https://github.com/jbraithwaite/nodebrainz/)';

/**
 * Initialize Nodebrainz
 *
 * The configuration:
 * - userAgent: the application name (needed for the user-agent)
 *
 * @param array $config The application configuration
 */
function BaseNodeBrainz(options) {

  // Set the userAgent if it exists
  if (config.hasOwnProperty('userAgent')) {
    _userAgent = config.userAgent;
  }
}

/**
 * NodeBrainsSearch
 *
 * http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/Search
 *
 * @param {String} type The type of search (e.g. 'artist','releasegroup','release','recording','work','label')
 * @param {Object} searchFields What to search for (e.g. {artist:'tool'})
 * @param {Function} callback The callback (err,data)
 */
var NodeBrainsSearch = function(type, searchFields, callback){

  var query = '';
  var limit = _limit;
  var offset = 0;

  searchFields = searchFields || {};

  // See if the limit has been included in the search fields
  if (searchFields.hasOwnProperty('limit')){
    // Set the limit
    limit = searchFields.limit;
    // Delete it from search fields
    delete searchFields.limit;
  }

  // See if offset has been included in the search fields
  if (searchFields.hasOwnProperty('offset')){
    // Set the offset
    offset = searchFields.offset;
    // Delete it from search fields
    delete searchFields.offset;
  }

  // Set the query
  for (var key in searchFields){
    query += key + ':' + encodeURIComponent(searchFields[key]);
  }

  // Set the path
  var path = MB_BASE + type + '/?query=' + query + '&limit=' + limit + '&offset=' + offset + '&fmt=json';

  request(path, callback);
};

/**
 * NodeBrainsLookup
 *
 * http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/#Lookups
 *
 * @param {String} type The type of search (e.g. 'artist','releasegroup','release','recording','work','label')
 * @param {String} mbid The id for the type
 * @param {Object} data The lookup criteria
 * @param {Function} callback The callback (err,data)
 */
var NodeBrainsLookup = function(type, mbid, data, callback){

  if (!mbid) return callback({error:'Missing mbid'});

  var query = {};
  var inc = '';

  data = data || {};

  // JSON response
  query.fmt = 'json';

  // Include
  if (data.hasOwnProperty('inc')){
    // Can't pass this to the querystring object because it turns '+' into '%2B'
    inc = '&inc=' + data.inc;

    // Remove the include
    delete data.inc;
  }

  // Everything else (e.g. limit, offset, type, status)
  for (var key in data){
    query[key] = data[key];
  }

  // Make the query string;
  query = querystring.stringify(query);

  // Set the path
  var path = MB_BASE + type + '/'+ mbid +'?' + query + inc;

  request(path, callback);
};

/**
 * NodeBrainsBrowse
 *
 * http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/#Browse
 *
 * @param {String} type The type of search (e.g. 'artist','releasegroup','release','recording','work','label')
 * @param {Object} data What to filter by and include
 * @param {Function} callback The callback (err,data)
 */
var NodeBrainsBrowse = function(type, data, callback){

  var query = {};
  var inc = '';

  data = data || {};

  // JSON response
  query.fmt = 'json';

  // Include
  if (data.hasOwnProperty('inc')){
    // Can't pass this to the querystring object because it turns '+' into '%2B'
    inc = '&inc=' + data.inc;

    // Remove the include
    delete data.inc;
  }

  // Everything else (e.g. limit, offset, type, status)
  for (var key in data){
    query[key] = data[key];
  }

  // Make the query string;
  query = querystring.stringify(query);

  // Set the path
  var path = MB_BASE + type + '?' + query + inc;

  request(path, callback);
};

var request = function(path, callback){

  var options = {
    host: MB_HOST,
    path: path,
    headers: {
      'user-agent': _userAgent
    },
    json: true
  };

  // Make the request
  http.get(options, function(res) {

    // Server did not like our request
    if (res.statusCode == 401) return callback({error:'Authorization required',statusCode:res.statusCode});
    else if (res.statusCode == 500) return callback({error:'Musicbrainz issue',statusCode:res.statusCode});
    else if (res.statusCode == 404) return callback({error:'Not Found',statusCode:res.statusCode});
    else if (res.statusCode != 200 && res.statusCode != 400) return callback({error:'Well that did not work',statusCode:res.statusCode});

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

BaseNodeBrainz.prototype.search = NodeBrainsSearch;

BaseNodeBrainz.prototype.browse = NodeBrainsBrowse;

BaseNodeBrainz.prototype.artist = function(mbid, data, callback){
  NodeBrainsLookup('artist', mbid , data, callback);
};

BaseNodeBrainz.prototype.releaseGroup = function(mbid, data, callback){
  NodeBrainsLookup('release-group', mbid , data, callback);
};

BaseNodeBrainz.prototype.release = function(mbid, data, callback){
  NodeBrainsLookup('release', mbid , data, callback);
};

BaseNodeBrainz.prototype.recording = function(mbid, data, callback){
  NodeBrainsLookup('recording', mbid , data, callback);
};

BaseNodeBrainz.prototype.work = function(mbid, data, callback){
  NodeBrainsLookup('work', mbid , data, callback);
};

BaseNodeBrainz.prototype.label = function(mbid, data, callback){
  NodeBrainsLookup('label', mbid , data, callback);
};

BaseNodeBrainz.prototype.area = function(mbid, data, callback){
  NodeBrainsLookup('label', mbid , data, callback);
};

BaseNodeBrainz.prototype.url = function(mbid, data, callback){
  NodeBrainsLookup('label', mbid , data, callback);
};


module.exports = BaseNodeBrainz;
