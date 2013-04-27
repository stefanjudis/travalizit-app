/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var builds    = module.exports = {},
    pg        = require( 'pg' ),
    conString = "tcp://stefan@localhost/travis",
    client,
    query;


builds.get = function( req, res ) {
  var queryString = 'SELECT DATE(created_at) AS day, count(*) FROM builds',
      queryParams = req.query,
      startDate   = queryParams.startDate || undefined,
      endDate     = queryParams.endDate || undefined;

  if ( startDate && endDate ) {
    startDate = new Date( startDate ).toISOString();
    endDate   = new Date( endDate ).toISOString();

    client = new pg.Client( conString );

    queryString += ' WHERE ' +
                      'created_at BETWEEN ' +
                        'timestamp \'' + startDate + '\' ' +
                      'AND ' +
                        'timestamp \'' + endDate + '\'';

    queryString += ' GROUP BY day';

    client.connect( function( error ) {
      query = client.query(
              queryString,
              function( error, result ) {
                if ( !error ) {
                  res.send( result.rows );

                  client.end();
                } else {
                  console.log( error );
                }
              }
            );
    });

  } else {

  }
};
