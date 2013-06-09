/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var repos     = module.exports = {},
    Github    = require( 'github' ),
    github    = new Github( { version : '3.0.0', timeout : 5000 } ),
    pg        = require( 'pg' ),
    conString = process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_VIOLET_URL,
    client;


repos.get = function( req, res ) {
  var queryParams  = req.query,
      repoOwner    = queryParams.repoOwner,
      repoName     = queryParams.repoName,
      responseObject = {},
      client,
      queryString;

  github.repos.get(
    {
      user : repoOwner,
      repo : repoName
    },
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

        console.log(queryString);
        client.connect( function( error ) {
          if ( error ) {
            console.log( error );
            res.send( 500 );
          } else {
            client.query(
              queryString,
              function( error, result ) {
                console.log('error');
                console.log(result);

                if ( error ) {
                  console.log( error );

                  res.send(500);
                } else {
                  responseObject.builds = result;

                  res.send( responseObject );

                  client.end();
                }
              }
            );
          }
        });
      }
    }
  );
};
