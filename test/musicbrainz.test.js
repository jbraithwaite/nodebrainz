var NB = require('../lib/nodebrainz');

// We don't actually want to make real http requests, this fakes it for us.
NB.prototype.request = function(config, callback){

  var options = {
    host: config.host,
    path: config.path,
    headers: {
      'user-agent': config.userAgent
    },
    json: true
  };

  callback(null,{response:'faked'}) ;
};


var assert = require("assert");

describe('nb', function(){

  // Describe the constructor
  describe('Constructor', function(){

    describe('Defaults', function(){
      it('limit', function(){
        var nb = new NB();
        assert.equal(nb.limit, 25);
      });

      it('host', function(){
        var nb = new NB();
        assert.equal(nb.host, 'musicbrainz.org');
      });

      it('path', function(){
        var nb = new NB();
        assert.equal(nb.basePath, '/ws/2/');
      });
    });

    it('Can set User Agent', function(){
      var nb = new NB({userAgent:'my-app/0.0.1 ( http://myapp.com )'});
      assert.equal(nb.userAgent, 'my-app/0.0.1 ( http://myapp.com )');

    });

    it('Can set Host', function(){
      var nb = new NB({host:'localhost'});
      assert.equal(nb.host, 'localhost');

    });

    it('Can set Path', function(){
      var nb = new NB({basePath:'/path/to/data/'});
      assert.equal(nb.basePath, '/path/to/data/');
    });

    it('Can set Default limit', function(){
      var nb = new NB({defaultLimit:50});
      assert.equal(nb.limit, 50);
    });

    it('Can set all at the same time', function(){
      var nb = new NB({host:'localhost',basePath:'/path/to/data/',userAgent:'my-app/0.0.1 ( http://myapp.com )'});
      assert.equal(nb.userAgent, 'my-app/0.0.1 ( http://myapp.com )');
      assert.equal(nb.host, 'localhost');
      assert.equal(nb.basePath, '/path/to/data/');
    });

  });

  // Describe lookup for...
  describe('Lookup', function(){

    // Artists
    describe('Artist', function(){

      it('By Artist ID', function(){
        var nb = new NB();

        nb.artist('e0140a67-e4d1-4f13-8a01-364355bee46e', {} , function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/artist/e0140a67-e4d1-4f13-8a01-364355bee46e?fmt=json');
        });
      });

      it('Only two arguments', function(){
        var nb = new NB();

        nb.artist('e0140a67-e4d1-4f13-8a01-364355bee46e', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/artist/e0140a67-e4d1-4f13-8a01-364355bee46e?fmt=json');
        });
      });

      it('With subquery', function(){
        var nb = new NB();

        nb.artist('e0140a67-e4d1-4f13-8a01-364355bee46e', {inc:'aliases+release-groups'} , function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/artist/e0140a67-e4d1-4f13-8a01-364355bee46e?fmt=json&inc=aliases+release-groups');
        });
      });
    });

    // Release
    describe('Release', function(){

      it('By Release ID', function(){
        var nb = new NB();

        nb.release('6bfba6d5-71fc-454b-b3a0-63632a1459fa', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/release/6bfba6d5-71fc-454b-b3a0-63632a1459fa?fmt=json');
        });
      });
    });

    // Release Group
    describe('Release Group', function(){

      it('By Release Group ID', function(){
        var nb = new NB();

        nb.releaseGroup('6bfba6d5-71fc-454b-b3a0-63632a1459fa', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/release-group/6bfba6d5-71fc-454b-b3a0-63632a1459fa?fmt=json');
        });
      });
    });

    // Recording
    describe('Recording', function(){

      it('By Recording ID', function(){
        var nb = new NB();

        nb.recording('811cfc83-0c1a-44d6-b644-3740ac313016', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/recording/811cfc83-0c1a-44d6-b644-3740ac313016?fmt=json');
        });
      });
    });

    // Work
    describe('Work', function(){

      it('By Work ID', function(){
        var nb = new NB();

        nb.work('282c08bb-9bd8-37be-9e36-f816d16f9a48', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/work/282c08bb-9bd8-37be-9e36-f816d16f9a48?fmt=json');
        });
      });
    });

    // Label
    describe('Label', function(){

      it('By Label ID', function(){
        var nb = new NB();

        nb.label('dfd92cd3-4888-46d2-b968-328b1feb2642', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/label/dfd92cd3-4888-46d2-b968-328b1feb2642?fmt=json');
        });
      });
    });

    // URL
    describe('URL', function(){

      it('By URL ID', function(){
        var nb = new NB();

        nb.url('13a37218-94c4-4844-8f6e-f843fe88e444', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/url/13a37218-94c4-4844-8f6e-f843fe88e444?fmt=json');
        });
      });
    });

    // Area
    describe('Area', function(){

      it('By Area ID', function(){
        var nb = new NB();

        nb.area('db3634e7-5414-41dd-be0b-68ae71798dcd', function(err, response){
          assert.equal(err, null);
          assert.equal(nb.path, '/ws/2/area/db3634e7-5414-41dd-be0b-68ae71798dcd?fmt=json');
        });
      });
    });
  });


  // Describe search
  describe('Search', function(){

    // A query must be set
    it('Must set query', function(){
      var nb = new NB();

      nb.search('artist', {} , function(err, response){
        assert.notEqual(err, null);
      });
    });

    // Test search
    it('Basic functionality', function(){
      var nb = new NB();

      nb.search('artist', {artist:'tool', country:'US'} , function(err, response){
        assert.equal(err, null);
        assert.equal(nb.path, '/ws/2/artist/?query=artist:\"tool\"%20AND%20country:\"US\"&limit=25&offset=0&fmt=json');
      });
    });

    // Test search
    it('Limit and offset', function(){
      var nb = new NB();

      nb.search('release', {artist:'pink floyd', limit:20, offset:5}, function(err, response){
        assert.equal(err, null);
        assert.equal(nb.path, '/ws/2/release/?query=artist:"pink%20floyd"&limit=20&offset=5&fmt=json');
      });
    });

  });

  // Describe Lucene search
  describe('Lucene Search', function(){

    // A query must be set
    it('Must set query', function(){
      var nb = new NB();

      nb.luceneSearch('artist', {} , function(err, response){
        assert.notEqual(err, null);
      });

      nb.luceneSearch('artist', {limit:5} , function(err, response){
        assert.notEqual(err, null);
      });

      nb.luceneSearch('artist', {query:'artist:t??l AND -artist:"Jethro Tull"'} , function(err, response){
        assert.equal(err, null);
      });
    });

    // Test search
    it('Basic functionality', function(){
      var nb = new NB();

      nb.luceneSearch('artist', {query:'artist:t??l AND -artist:"Jethro Tull"'} , function(err, response){
        assert.equal(err, null);
        assert.equal(nb.path, '/ws/2/artist/?query=artist%3At%3F%3Fl%20AND%20-artist%3A%22Jethro%20Tull%22&limit=25&offset=0&fmt=json');
      });
    });

    // Limit and offset
    it('Limit and offset', function(){
      var nb = new NB();

      nb.luceneSearch('artist', {query:'artist:t??l AND -artist:"Jethro Tull"', limit:5, offset:10} , function(err, response){
        assert.equal(err, null);
        assert.equal(nb.path, '/ws/2/artist/?query=artist%3At%3F%3Fl%20AND%20-artist%3A%22Jethro%20Tull%22&limit=5&offset=10&fmt=json');
      });
    });
  });

  // Describe Browse
  describe('Browse', function(){

    // A query must be set
    it('Basic functionality', function(){
      var nb = new NB();

      nb.browse('release-group', {artist:'e0140a67-e4d1-4f13-8a01-364355bee46e'}, function(err, response){
          assert.equal(nb.path, '/ws/2/release-group?fmt=json&artist=e0140a67-e4d1-4f13-8a01-364355bee46e');
      });
    });

    // Limit and offset
    it('Limit and offset', function(){
      var nb = new NB();

      nb.browse('release-group', {artist:'e0140a67-e4d1-4f13-8a01-364355bee46e', limit:2, offset:1}, function(err, response){
          assert.equal(nb.path, '/ws/2/release-group?fmt=json&artist=e0140a67-e4d1-4f13-8a01-364355bee46e&limit=2&offset=1');
      });

    });

    // A little more functionality
    it('Advance functionality', function(){
      var nb = new NB();

      nb.browse('release-group', {artist:'e0140a67-e4d1-4f13-8a01-364355bee46e', type:'album', limit:2, offset:1, inc: 'artist-credits'}, function(err, response){
          assert.equal(nb.path, '/ws/2/release-group?fmt=json&artist=e0140a67-e4d1-4f13-8a01-364355bee46e&type=album&limit=2&offset=1&inc=artist-credits');
      });
    });

  });
});
