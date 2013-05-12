/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var builds    = module.exports = {},
    pg        = require( 'pg' ),
    conString = 'tcp://stefan@localhost/travis',
    client,
    query;


builds.get = function( req, res ) {
  var queryParams  = req.query,
      //date        = queryParams.date || undefined,
      startDate    = queryParams.startDate || undefined,
      endDate      = queryParams.endDate || undefined,
      unit         = queryParams.unit || 'days',
      queryOptions = {
        startDate : startDate,
        endDate   : endDate,
        unit      : unit
      };

  if ( startDate && endDate ) {
    builds._getDateBetweenData( queryOptions, req, res );
  }

  // if ( date ) {
  //   this._getDateData( date );
  // }
};


builds._getDateBetweenData = function( options, req, res ) {
    console.log(options);
    var startDate   = new Date( options.startDate ).toISOString(),
        endDate     = new Date( options.endDate ).toISOString(),
        queryString = '';

    queryString += 'SELECT ';

    if ( options.unit === 'days' ) {
      queryString += 'DATE(created_at) AS unit, ';
    }

    if ( options.unit === 'weeks' ) {
      queryString += 'EXTRACT (WEEK FROM created_at) AS unit,';
    }

    queryString += 'COUNT(*) AS totalbuilds, ' +
      'COUNT(CASE WHEN status = 1 THEN 1 ELSE NULL END) AS successful, ' +
      'COUNT(CASE WHEN status = 0 THEN 1 ELSE NULL END) AS failed, ' +
      'COUNT(CASE WHEN status IS NULL THEN 1 ELSE NULL END) AS nodata ' +
    'FROM builds';

    client = new pg.Client( conString );

    queryString += ' WHERE ' +
                      'created_at BETWEEN ' +
                        'timestamp \'' + startDate + '\' ' +
                      'AND ' +
                        'timestamp \'' + endDate + '\'';


    queryString += ' GROUP BY unit';

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
