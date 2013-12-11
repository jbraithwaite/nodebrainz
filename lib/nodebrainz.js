var querystring = require('querystring');
var request = require('./request');

var VERSION = '0.1.2';
var _host = 'musicbrainz.org';
var _path = '/ws/2/';
var _limit = 25;
var _userAgent = 'nodebrainz/' + VERSION + ' ( https://github.com/jbraithwaite/nodebrainz/ )';

/**
 * Initialize Nodebrainz
 *
 * The configuration:
 * - host: custom host for querying data
 * - path: custom path to the data
 * - defaultLimit: default limit on request that require it
 * - userAgent: User agent sent in the request
 *
 * @param {Object} options The application configuration
 */
function BaseNodeBrainz(options) {

  options = options || {};

  this.host = options.host || _host;
  this.path = options.path || _path;
  this.limit = options.defaultLimit || _limit;
  this.userAgent = options.userAgent || _userAgent;
}

/**
 * Search
 *
 * http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/Search
 *
 * @param {String} type The type of search (e.g. 'artist','releasegroup','release','recording','work','label')
 * @param {Object} searchFields What to search for (e.g. {artist:'tool'})
 * @param {Function} callback The callback (err,data)
 */
BaseNodeBrainz.prototype.search = function(type, searchFields, callback){

  var query = '';
  var limit = this.limit;
  var offset = 0;
  var and = '';

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
  // https://lucene.apache.org/core/4_3_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description
  for (var key in searchFields){
    query += and + key + ':' + '"'+ encodeURIComponent(searchFields[key]) +'"';
    and = '%20AND%20';
  }

  // Set the path
  var path = this.path + type + '/?query=' + query + '&limit=' + limit + '&offset=' + offset + '&fmt=json';

  request({
    host: this.host,
    path: path,
    userAgent: this.userAgent
  }, callback);
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
BaseNodeBrainz.prototype.browse = function(type, data, callback){

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
  var path = this.path + type + '?' + query + inc;

  request({
    host: this.host,
    path: path,
    userAgent: this.userAgent
  }, callback);
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
BaseNodeBrainz.prototype._lookup = function(type, mbid, data, callback){

  data = data || {};

  // You are allowed to not include data
  if (typeof data == 'function'){
    callback = data;
    data = {};
  }

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
  var path = this.path + type + '/'+ mbid +'?' + query + inc;

  request({
    host: this.host,
    path: path,
    userAgent: this.userAgent
  }, callback);
};

BaseNodeBrainz.prototype.artist = function(mbid, data, callback){
  this._lookup('artist', mbid , data, callback);
};

BaseNodeBrainz.prototype.releaseGroup = function(mbid, data, callback){
  this._lookup('release-group', mbid , data, callback);
};

BaseNodeBrainz.prototype.release = function(mbid, data, callback){
  this._lookup('release', mbid , data, callback);
};

BaseNodeBrainz.prototype.recording = function(mbid, data, callback){
  this._lookup('recording', mbid , data, callback);
};

BaseNodeBrainz.prototype.work = function(mbid, data, callback){
  this._lookup('work', mbid , data, callback);
};

BaseNodeBrainz.prototype.label = function(mbid, data, callback){
  this._lookup('label', mbid , data, callback);
};

BaseNodeBrainz.prototype.area = function(mbid, data, callback){
  this._lookup('label', mbid , data, callback);
};

BaseNodeBrainz.prototype.url = function(mbid, data, callback){
  this._lookup('label', mbid , data, callback);
};


module.exports = BaseNodeBrainz;
