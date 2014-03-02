var querystring = require('querystring');
var request = require('./request');

var VERSION = '1.0.0';
var _host = 'musicbrainz.org';
var _port = 80;
var _path = '/ws/2/';
var _limit = 25;
var _userAgent = 'nodebrainz/' + VERSION + ' ( https://github.com/jbraithwaite/nodebrainz/ )';

/**
 * Initialize Nodebrainz
 *
 * The configuration:
 * - host: custom host for querying data
 * - basePath: custom path to the data
 * - defaultLimit: default limit on request that require it
 * - userAgent: User agent sent in the request
 *
 * @param {Object} options The application configuration
 */
function BaseNodeBrainz(options) {

  options = options || {};

  this.host = options.host || _host;
  this.port = options.port || _port;
  this.basePath = options.basePath || _path;
  this.limit = options.defaultLimit || _limit;
  this.userAgent = options.userAgent || _userAgent;
}

BaseNodeBrainz.prototype.request = request;
BaseNodeBrainz.prototype.executeRequest = function(callback) {
  this.request({
    host: this.host,
    port: this.port,
    path: this.path,
    userAgent: this.userAgent
  }, callback);
};

/**
 * Search
 *
 * Provides a way to search for entities. Behind the scenes, results are provided by a search server using Lucene technology.
 * Note there are different search fields depending on the entity.
 *
 * http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/Search
 *
 * @param {String} type The type of search (e.g. 'artist', 'releasegroup', 'release', 'recording', etc)
 * @param {Object} searchFields What to search for (e.g. {artist:'tool'})
 * @param {Function} callback function(err, response)
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
  this.path = this.basePath + type + '/?query=' + query + '&limit=' + limit + '&offset=' + offset + '&fmt=json';

  if (query === '') return callback({error:'You must search for something'});

  this.executeRequest(callback);
};

/**
 * Lucene Search
 *
 * Direct access to the Lucene search query
 *
 * https://lucene.apache.org/core/4_3_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package_description
 *
 * @param  {String} type Entity type
 * @param  {Oject} data {query:'something AND something'}
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.luceneSearch = function(type, data, callback){

  var limit = this.limit;
  var offset = 0;
  var query = '';

  data = data || {};

  if (!data.hasOwnProperty('query')) return callback({error: 'Missing query'});

  // Encode the query
  query = encodeURIComponent(data.query);

  // See if the limit has been included in the search fields
  if (data.hasOwnProperty('limit')){
    // Set the limit
    limit = data.limit;
  }

  // See if offset has been included in the search fields
  if (data.hasOwnProperty('offset')){
    // Set the offset
    offset = data.offset;
  }

  // Set the path
  this.path = this.basePath + type + '/?query=' + query + '&limit=' + limit + '&offset=' + offset + '&fmt=json';

  if (query === '') return callback({error:'You must search for something'});

  this.executeRequest(callback);
};

/**
 * NodeBrainsBrowse
 *
 * Browse requests are a direct lookup of all the entities directly linked to another entity.
 * Browsed entities are always ordered alphabetically by gid. If you need to sort the entities,
 * you will have to fetch all entities and sort them yourself. For pagination, set a limit and offset.
 * Note that browse requests are not searches, in order to browse all the releases-groups for an artist,
 * you need to provide the MBID for the artist.
 *
 * http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/#Browse
 *
 * @param {String} type The type of search (e.g. 'artist', 'releasegroup', 'release', 'recording', etc)
 * @param {Object} data What to filter by and include
 * @param {Function} callback function(err, response)
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
  this.path = this.basePath + type + '?' + query + inc;

  this.executeRequest(callback);
};

/**
 * NodeBrainsLookup
 *
 * http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/#Lookups
 *
 * @param {String} type The type of search (e.g. 'artist', 'releasegroup', 'release', 'recording', etc)
 * @param {String} mbid The id for the type
 * @param {Object} data The lookup criteria
 * @param {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype._lookup = function(type, mbid, data, callback){

  data = data || {};

  // You are allowed to not include data
  if (typeof data == 'function'){
    callback = data;
    data = {};
  }

  if (!mbid) return callback({error: 'Missing mbid'});

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
  this.path = this.basePath + type + '/' + mbid + '?' + query + inc;

  this.executeRequest(callback);
};

/**
 * Artist Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.artist = function(mbid, data, callback){
  this._lookup('artist', mbid, data, callback);
};

/**
 * Release Group Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.releaseGroup = function(mbid, data, callback){
  this._lookup('release-group', mbid, data, callback);
};

/**
 * Release Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.release = function(mbid, data, callback){
  this._lookup('release', mbid, data, callback);
};

/**
 * Recording Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.recording = function(mbid, data, callback){
  this._lookup('recording', mbid, data, callback);
};

/**
 * Work Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.work = function(mbid, data, callback){
  this._lookup('work', mbid, data, callback);
};

/**
 * Label Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.label = function(mbid, data, callback){
  this._lookup('label', mbid, data, callback);
};

/**
 * Area Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.area = function(mbid, data, callback){
  this._lookup('area', mbid, data, callback);
};

/**
 * URL Lookup
 *
 * @param  {String} mbid MusicBrainz ID
 * @param  {Object} data Filtering and subqueries information
 * @param  {Function} callback function(err, response)
 */
BaseNodeBrainz.prototype.url = function(mbid, data, callback){
  this._lookup('url', mbid, data, callback);
};

module.exports = BaseNodeBrainz;
