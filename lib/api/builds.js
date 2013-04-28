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
  var queryParams = req.query,
      date        = queryParams.date || undefined,
      startDate   = queryParams.startDate || undefined,
      endDate     = queryParams.endDate || undefined;

  if ( startDate && endDate ) {
    builds._getDateBetweenData( startDate, endDate, req, res );
  }

  if ( date ) {
    this._getDateData( date );
  }
};


builds._getDateBetweenData = function( startDate, endDate, req, res ) {
    var queryString = 'SELECT ' +
                        'DATE(created_at) AS day, ' +
                        'COUNT(*) AS totalBuilds, ' +
                        'COUNT(CASE WHEN status = 1 THEN 1 ELSE NULL END) AS successful ' +
                      'FROM builds',
        startDate = new Date( startDate ).toISOString();
        endDate   = new Date( endDate ).toISOString();

    client = new pg.Client( conString );

    queryString += ' WHERE ' +
                      'created_at BETWEEN ' +
                        'timestamp \'' + startDate + '\' ' +
                      'AND ' +
                        'timestamp \'' + endDate + '\'';

    queryString += ' GROUP BY day';

    console.log( queryString );

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
};
