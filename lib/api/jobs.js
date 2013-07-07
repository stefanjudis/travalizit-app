/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var jobs       = module.exports = {},
    pg         = require( 'pg'),
    conString  = process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_VIOLET_URL,
    travalizit = require( 'travalizit' );



jobs.get = function( req, res ) {
  var queryParams = req.query,
      repoOwner   = queryParams.repoOwner,
      repoName    = queryParams.repoName;

  if ( repoOwner && repoName ) {
    jobs._getJobData( repoOwner, repoName, res );
  } else {
    res.send(
      404,
      'Owner and Name not found.'
    );
  }
};


jobs._getJobData = function( owner, name, res ) {
  jobs.client = new pg.Client( conString );
  jobs.client.connect( function( error ) {
    if ( error ) {
      res.send(
        500,
        error
      );
    } else {
      var queryString =
        'SELECT id, repository_id, number ' +
        'FROM travalizit_builds ' +
        'WHERE ' +
          'owner_name LIKE \'' + owner + '\' ' +
        'AND ' +
          'repository_name LIKE \'' + name + '\' ' +
        'ORDER BY id DESC ' +
        'LIMIT 10';

      jobs.client.query(
        queryString,
        function( error, result ) {
          if ( error ) {
            res.send(
              500,
              error
            );
          } else {
            if ( result.rows.length ) {
              var sortedRows = result.rows.sort( function( rowA, rowB ) {
                return +rowA.id - +rowB.id;
              } );
              jobs._fetchJobData( owner, name, sortedRows, res );
            } else {
              res.send( {
                builds : []
              } );
            }

            jobs.client.end();
          }
        }
      );
    }
  } );
};


jobs._fetchJobData = function( owner, name, builds, res ) {
  console.log( '_fetchJobData' );
  builds = builds.map( function( build ) {
    return build.id;
  } );

  travalizit.Jobs( {
    owner : owner,
    name  : name
  } ).get( 'builds', builds, function( error, builds ) {
    if ( error ) {
      res.send( error, 500 );
    }

    jobs._prepareAndSendJobData( builds, res );
  } );
};


jobs._prepareAndSendJobData = function( builds, res ) {
  var maxDuration        = 0,
      buildsWithDuration = builds.map( function( build ) {
    for ( var buildKey in build ) {
      build[ buildKey ].jobs = build[ buildKey ].jobs.map( function( job ) {
        var startedAt  = new Date( Date.parse( job.started_at ) ),
            finishedAt = new Date( Date.parse( job.finished_at ) ),
            duration   = finishedAt.valueOf() - startedAt.valueOf();

        job.duration = duration;

        // set max value for usage in frontend
        if ( duration > maxDuration ) {
          maxDuration = duration;
        }

        return job;
      } ).sort( function( jobA, jobB ) {
        return +jobA.id - +jobB.id;
      } );
    }

    return build;
  } ).sort( function( buildA, buildB ) {
    return +Object.keys( buildA )[ 0 ] - +Object.keys( buildB )[ 0 ];
  } );
  res.send( {
    maxDuration : maxDuration,
    builds      : buildsWithDuration
  } );
};


