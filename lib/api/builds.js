/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var builds    = module.exports = {},
    pg        = require( 'pg' ),
    conString = process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_VIOLET_URL,
    client;


builds.get = function( req, res ) {
  var queryParams  = req.query,
      date         = queryParams.date,
      startDate    = queryParams.startDate,
      endDate      = queryParams.endDate,
      unit         = queryParams.unit || 'days',
      queryOptions = {
        startDate : startDate,
        endDate   : endDate,
        unit      : unit
      },
      week         = queryParams.week;

  if ( startDate && endDate ) {
    builds._getDateBetweenData( queryOptions, req, res );
  }

  if ( unit === 'day' ) {
    builds._getDateData( date, req, res );
  }

  if ( unit === 'week' ) {
    builds._getWeekData( week,req, res );
  }
};


builds._getDateBetweenData = function( options, req, res ) {
  var startDate   = new Date( options.startDate ).toISOString(),
      endDate     = new Date( options.endDate ).toISOString(),
      queryString = 'SELECT ',
      query;

  if ( options.unit === 'days' ) {
    queryString += 'DATE(finished_at) AS unit, ';
  }

  if ( options.unit === 'weeks' ) {
    queryString += 'EXTRACT (WEEK FROM finished_at) AS unit,';
  }

  queryString += 'COUNT(*) AS totalbuilds, ' +
    'COUNT(CASE WHEN status = 1 THEN 1 ELSE NULL END) AS successful, ' +
    'COUNT(CASE WHEN status = 0 THEN 1 ELSE NULL END) AS failed, ' +
    'COUNT(CASE WHEN status IS NULL THEN 1 ELSE NULL END) AS nodata ' +
  'FROM travalizit_builds';

  client = new pg.Client( conString );

  queryString += ' WHERE ' +
                    'finished_at BETWEEN ' +
                      'timestamp \'' + startDate + '\' ' +
                    'AND ' +
                      'timestamp \'' + endDate + '\'';


  queryString += ' GROUP BY unit ';
  queryString += ' ORDER BY unit ASC';

  client.connect( function( error ) {
    if ( error ) {
      console.log(error);

      res.send(500);
    } else {
      client.query(
        queryString,
        function( error, result ) {
          if ( !error ) {
            res.send( result.rows );

            client.end();
          } else {
            console.log( error );
          }

          client.end();
        }
      );
    }
  });
};


builds._getDateData = function( dateInput, req, res ) {
  var date   = new Date( dateInput ).toISOString(),
      queryString = 'SELECT ';

  queryString += 'DATE(finished_at) AS unit, ' +
                  'COUNT(DISTINCT repository_id) AS repositories, ' +
                  'COUNT(CASE WHEN owner_type LIKE \'User\' THEN 1 ELSE NULL END) AS user, ' +
                  'COUNT(CASE WHEN owner_type LIKE \'Organization\' THEN 1 ELSE NULL END) AS organisation, ' +
                  'COUNT(CASE WHEN event_type LIKE \'push\' THEN 1 ELSE NULL END) AS push, ' +
                  'COUNT(CASE WHEN event_type LIKE \'pull_request\' THEN 1 ELSE NULL END) AS pull ' +
                'FROM travalizit_builds';

  client = new pg.Client( conString );

  queryString += ' WHERE ' +
                    'finished_at::date = \'' + date + '\'::timestamp::date ';

  queryString += 'GROUP BY unit';

  client.connect( function( error ) {
    var resultObject = {};

    //TODO encapsulate the callbacks - not readable anymore
    client.query(
      queryString,
      function( error, result ) {
        if ( !error ) {
          resultObject.general = result.rows;

          client.query(
            'SELECT ' +
              'repository_id AS repo, ' +
              'repository_name AS name,' +
              'owner_name AS owner,' +
              'language,' +
              'COUNT(repository_id) as count ' +
            'FROM travalizit_builds ' +
              'WHERE finished_at::date = \'' + date + '\' ::timestamp::date ' +
            'GROUP BY repo, name, owner, language ' +
            'ORDER BY count DESC ' +
            'LIMIT 15 ',
            function( error, result ) {
              console.log(result);
              if ( !error ) {
                resultObject.repos = result.rows;

                res.send( [ resultObject ] );

                client.end();
              } else {
                console.log( error );
              }
            }
          );
        } else {
          console.log( error );
        }
      }
    );
  });
};


builds._getWeekData = function( week, req, res ) {
  var queryString = 'SELECT ';

  queryString += 'EXTRACT (WEEK FROM finished_at) AS unit, ' +
                  'COUNT(DISTINCT repository_id) AS repositories, ' +
                  'COUNT(CASE WHEN owner_type LIKE \'User\' THEN 1 ELSE NULL END) AS user, ' +
                  'COUNT(CASE WHEN owner_type LIKE \'Organization\' THEN 1 ELSE NULL END) AS organisation, ' +
                  'COUNT(CASE WHEN event_type LIKE \'push\' THEN 1 ELSE NULL END) AS push, ' +
                  'COUNT(CASE WHEN event_type LIKE \'pull_request\' THEN 1 ELSE NULL END) AS pull ' +
                'FROM travalizit_builds';

  client = new pg.Client( conString );

  queryString += ' WHERE ' +
                    'EXTRACT (WEEK FROM finished_at) = \'' + week + '\' ';

  queryString += 'GROUP BY unit';

  client.connect( function( error ) {
    var resultObject = {};

    //TODO encapsulate the callbacks - not readable anymore
    var query = client.query(
      queryString,
      function( error, result ) {
        if ( !error ) {
          resultObject.general = result.rows;

          client.query(
            'SELECT ' +
              'repository_id AS repo, ' +
              'repository_name AS name,' +
              'owner_name AS owner,' +
              'language AS language,' +
              'COUNT(repository_id) as count ' +
            'FROM travalizit_builds ' +
              'WHERE EXTRACT (WEEK FROM finished_at) = \'' + week + '\' ' +
            'GROUP BY repo, name, owner, language ' +
            'ORDER BY count DESC ' +
            'LIMIT 15',
            function( error, result ) {
              if ( !error ) {
                resultObject.repos = result.rows;

                res.send( [ resultObject ] );

                client.end();
              } else {
                console.log( error );
              }
            }
          );
        } else {
          console.log( error );
        }
      }
    );
  });
};


builds.post = function( req, res ) {
  var body = req.body,
      paramsArray,
      payload = JSON.parse(body.payload),
      queryString,
      status;

  if (Object.keys(body).length === 0) {
    res.send(400);
  } else {
    queryString = 'INSERT INTO travalizit_builds VALUES(';

    status = (payload.status_message === 'Passed' || payload.status === 1) ? 1 : 0;

    paramsArray = [
      '\'' + payload.id,             // id
      payload.repository.id,         // repository_id
      payload.number,                // number
      status,                        // status
      payload.started_at,            // started_at
      payload.finished_at,           // finished_at
      '-1',                          // request_id
      'NULL',                        // state
      payload.config.language,       // language
      payload.finished_at,           // archived_at
      payload.duration,              // duration
      '-1',                          // owner_id
      'NULL',                        // owner_type
      '-1',                          // result
      '-1',                          // previous_result
      'NULL',                        // event_type
      payload.repository.owner_name, // owver_name
      payload.repository.name + '\'' // repo name
    ];

    queryString +=  paramsArray.join( '\',\'' ) + ')';

    console.log(queryString);

    client = new pg.Client( conString );
    client.connect( function( error ) {
      if (error) {
        console.log(error);
        res.send(500);
      } else {
        client.query(queryString, function(error, result) {
          if (error) {
            console.log(error);
            res.send(500);
          } else {
            console.log(result);
            res.send(201);

            client.end();
          }
        });
      }
    });
  }
};
