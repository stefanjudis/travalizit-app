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
      date        = queryParams.date || undefined,
      startDate    = queryParams.startDate || undefined,
      endDate      = queryParams.endDate || undefined,
      unit         = queryParams.unit || 'days',
      queryOptions = {
        startDate : startDate,
        endDate   : endDate,
        unit      : unit
      },
      week         = queryParams.week || undefined;

  if ( startDate && endDate ) {
    builds._getDateBetweenData( queryOptions, req, res );
  }

  if ( date ) {
    builds._getDateData( date, req, res );
  }

  // if ( week ) {
  //   builds._getWeekData( week );
  // }
};


builds._getDateBetweenData = function( options, req, res ) {
  var startDate   = new Date( options.startDate ).toISOString(),
      endDate     = new Date( options.endDate ).toISOString(),
      queryString = 'SELECT ';

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


builds._getDateData = function( dateInput, req, res ) {
  var date   = new Date( dateInput ).toISOString(),
      queryString = 'SELECT ';

  console.log(dateInput);

  queryString += 'DATE(created_at) AS unit, ' +
                  'COUNT(DISTINCT repository_id) AS repositories, ' +
                  'COUNT(CASE WHEN owner_type LIKE \'User\' THEN 1 ELSE NULL END) AS user, ' +
                  'COUNT(CASE WHEN owner_type LIKE \'Organization\' THEN 1 ELSE NULL END) AS organisation, ' +
                  'COUNT(CASE WHEN event_type LIKE \'push\' THEN 1 ELSE NULL END) AS push, ' +
                  'COUNT(CASE WHEN event_type LIKE \'pull_request\' THEN 1 ELSE NULL END) AS pull ' +
                'FROM builds';

  client = new pg.Client( conString );

  queryString += ' WHERE ' +
                    'created_at::date = \'' + date + '\'::timestamp::date ';

  queryString += 'GROUP BY unit';

  console.log(queryString);
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
