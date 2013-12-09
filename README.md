# Another Musicbrainz Node Client

NodeBrainz gives you full access to the [MusicBrainz](http://musicbrainz.org/) Web Service Version 2. This includes [search](http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/Search), [lookup](http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/#Lookups) and [browse]().

## Example Usage

MusicBrainz asks that you [identifying your application](http://musicbrainz.org/doc/Development/XML_Web_Service/Version_2#Identifying_your_application_to_the_MusicBrainz_Web_Service) so be sure to set the `userAgent`. You may consider following the conventions of [RFC 1945](http://tools.ietf.org/html/rfc1945#section-3.7)

    var NB = require('nodebrainz');

    // Initialize the nodebrainz
    var nb = new NB({userAgent:'my-awesome-app/0.0.1 (+http://my-awesome-app.com)'})

#### Search

    nb.search('artist', {artist:'tool'}, function(err, response){
        if (err) { /*handle error*/ }
        console.log(response);
    });

#### Lookup

Lookups can be proformed on any of the eight resources:  `artist`, `label`, `recording`, `release`, `release-group`, `work`, `area`, `url`

    nb.artist(e0140a67-e4d1-4f13-8a01-364355bee46e, {inc:'releases', limit:2} , function(err,response){
        if (err) { /*handle error*/ }
        console.log(response);
    });

#### Browse

    nb.browse('release-group', {artist:'e0140a67-e4d1-4f13-8a01-364355bee46e',type:'album'} , function(err,response){
      if (err) { /*handle error*/ }
      console.log(response);
    });

##### More queries

    nb.search('artist', {artist:'the post service', limit: 4, offset: 2}, function(err,response){ /*work your magic*/ });

    nb.releaseGroup('df46f245-7f62-4982-9d2c-e83d7be91cbf', null, function(err,response){ /*work your magic*/ });

    nb.release('119c3af8-f649-491d-a219-ea8df4485106', {inc:'recordings+release-groups'}, function(err,response){ /*work your magic*/ });

    nb.label('dfd92cd3-4888-46d2-b968-328b1feb2642', null, function(err,response){ /*work your magic*/ });


## To Do

- Testing
