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


// TODO absolute callback hellllllllllll - fix it....
repos.get = function( req, res ) {
  var queryParams    = req.query,
      repoOwner      = queryParams.repoOwner,
      repoName       = queryParams.repoName,
      message        = {
        user : repoOwner,
        repo : repoName
      },
      responseObject = {},
      client,
      queryString;

  github.repos.get(
    message,
    function( error, repo ) {
      if ( error ) {
        console.log( error );
        res.send( 500 );
      } else {
        responseObject.github = repo;

        client = new pg.Client( conString );

        queryString = 'SELECT * ' +
                      'FROM travalizit_builds ' +
                      'WHERE ' +
                        'owner_name = \'' + repoOwner + '\' ' +
                      'AND ' +
                        'repository_name = \'' + repoName + '\'';

        client.connect( function( error ) {
          if ( error ) {
            repos._handleError( error, res, client )
          } else {
            client.query(
              queryString,
              function( error, result ) {
                var countFileFetch = 0;

                if ( error ) {
                  repos._handleError( error, res, client )
                } else {
                  responseObject.builds = result.rows;

                  repos._getBuildFiles(
                    responseObject,
                    function( error, result ) {
                      var currentBuild,
                          currentBuildIndex;

                      if ( error ) {
                        repos._handleError( error, res, client );
                      } else {
                        ++countFileFetch;

                        currentBuild = responseObject.builds.filter( function( build ) {
                          return build.commit === result.sha;
                        } )[ 0 ];

                        currentBuildIndex = responseObject.builds.indexOf( currentBuild );

                        responseObject.builds[ currentBuildIndex ].files = result.files;

                        if ( countFileFetch === responseObject.builds.length ) {
                          eventEmitter.emit( 'allFilesFetched', responseObject, res, client );
                        }
                      }
                    }
                  );
                }

                eventEmitter.on( 'allFilesFetched', function( responseObject ) {
                  res.send( responseObject );

                  client.end();
                } );
              }
            );
          }
        } );
      }
    }
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


repos._handleError = function( error, res, client ) {
  console.log( error );
  res.send( 500 );
  client.end();
};
