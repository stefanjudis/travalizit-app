/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var express  = require( 'express' ),
    app      = express(),
    hbs      = require( 'express-hbs' ),
    fs       = require( 'fs' ),

    libPath = __dirname + '/lib',
    apiPath = libPath + '/api',

    port = process.env.PORT || 3000;



app.set( 'view engine', 'hbs' );
app.engine(
  'hbs', hbs.express3(
    {
      partialsDir : libPath + '/views/partials'
    }
  )
);
app.set( 'views', libPath + '/views' );

app.use(express.static(__dirname + '/assets'));


app.get( '/',  function( req, res ){
  res.render( 'index', {
    title  : 'Travalizit'
  });
});

// lets build up the api calls
fs.readdir( apiPath, function( err, files ) {
  files.forEach(function( value ) {
    var callPath = '/' + value.replace( '.js', '' ),
        source   = require( apiPath + '/' + callPath);

    Object.keys( source ).forEach( function( verb ) {
      // ignore "privates"
      if ( verb[ 0 ] !== '_' ) {
        app[ verb ]( callPath, source[ verb ] );
      }
    });
  });
});


app.listen(port, function() {
  console.log('Listening on port ' + port);
});
