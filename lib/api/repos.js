/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var events       = require( 'events' ),
    eventEmitter = new events.EventEmitter(),
    repos        = module.exports = {},
    Github       = require( 'github' ),
    github       = new Github( { version : '3.0.0', timeout : 5000 } ),
    pg           = require( 'pg' ),
    conString    = process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_VIOLET_URL,
    client;

github.authenticate({
    type     : 'basic',
    username : 'stefanjudis',
    password : 'Htw2mdVahL&'
});

repos.get = function( req, res ) {
  var queryParams    = req.query,
      repoOwner      = queryParams.repoOwner,
      repoName       = queryParams.repoName,
      message        = {
        user : repoOwner,
        repo : repoName
      };

  github.repos.get(
    message,
    repos._githubReposGetHandler.bind( {
      repoName  : repoName,
      repoOwner : repoOwner,
      res       : res
    } )
  );
};


repos._getBuildFiles = function( responseObject, callback ) {
  var builds = responseObject.builds;

  builds.forEach(function( value, index, builds) {
    var message = {
      user : responseObject.github.owner.login,
      repo : responseObject.github.name,
      sha  : value.commit
    };

    github.repos.getCommit(
      message,
      callback
    );
  });
};


// TODO absolute callback hellllllllllll - fix it....
repos._githubReposGetHandler = function( error, repo ) {
  var queryString,
      responseObject = {};

  if ( error ) {
    repos._handleError( error, this.res, client );
  } else {
    responseObject.github = repo;

    client = new pg.Client( conString );

    queryString = 'SELECT * ' +
                  'FROM travalizit_builds ' +
                  'WHERE ' +
                    'owner_name = \'' + this.repoOwner + '\' ' +
                  'AND ' +
                    'repository_name = \'' + this.repoName + '\'';

    client.connect( function( error ) {
      if ( error ) {
        repos._handleError( error, this.res, client );
      } else {
        client.query(
          queryString,
          function( error, result ) {
            var countFileFetch = 0;

            if ( error ) {
              repos._handleError( error, this.res, client );
            } else {
              responseObject.builds = result.rows;
              responseObject.includedFiles = [];

              repos._getBuildFiles(
                responseObject,
                function( error, result ) {
                  var currentBuild,
                      currentBuildIndex;

                  if ( error ) {
                    repos._handleError( error, this.res, client );
                  } else {
                    ++countFileFetch;

                    // TODO that can be done smarter, can it???
                    currentBuild = responseObject.builds.filter( function( build ) {
                      return build.commit === result.sha;
                    } )[ 0 ];

                    currentBuildIndex = responseObject.builds.indexOf( currentBuild );

                    responseObject.builds[ currentBuildIndex ].files = result.files;
                    responseObject.includedFiles = responseObject.includedFiles.concat(result.files);


                    if ( countFileFetch === responseObject.builds.length ) {
                      eventEmitter.emit( 'allFilesFetched', responseObject, this.res, client );
                    }
                  }
                }.bind( this )
              );
            }

            // trigger response sending
            eventEmitter.on( 'allFilesFetched', repos._sendResponse );

          }.bind( this )
        );
      }
    }.bind( this ) );
  }
};


repos._handleError = function( error, res, client ) {
  console.log( error );
  res.send( 500 );

  if ( client ) {
    client.end();
  }
};


repos._sendResponse = function( responseObject, res, client ) {
  responseObject.uniqueIncludedFiles = repos._setUniqueFiles( responseObject.includedFiles );

  res.send( responseObject );


  client.end();
};


repos._setUniqueFiles = function( files ) {
  var uniqueFiles = [];

  files.forEach( function( value ) {
    var fileName = value.filename;

    if ( ! ~uniqueFiles.indexOf( fileName ) ) {
      uniqueFiles.push( fileName );
    }
  } );

  return uniqueFiles;
};
