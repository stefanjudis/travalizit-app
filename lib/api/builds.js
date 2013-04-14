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
  var queryString = 'select * from builds',
      queryParams = req.query,
      firstOne    = true;

  client = new pg.Client( conString );

  client.connect( function( error ) {
    Object.keys( queryParams ).forEach(function( value ) {
      if ( value !== 'type' && queryParams[ value ] ) {
        if ( firstOne ) {
          queryString += ' WHERE ';

          firstOne = false;
        }
        queryString += value + ' = ' + queryParams[ value ] + ' AND ';
      }
    });

    queryString = queryString.replace( /([\sAND]*)$/, '');

    query = client.query(
              queryString,
              function( error, result ) {
                if ( !error ) {
                  res.send( result.rows );

                  client.end();
                }
              }
            );
  });
};
