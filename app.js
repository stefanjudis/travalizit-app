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
    apiPath = libPath + '/api';



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
        verb     = require( apiPath + '/' + callPath );

    // make that in a loop
    app.get( callPath, verb.list );
    app.get( callPath + '/:id', verb.get );

    app.post( callPath + '/:id', verb.create );

    app.put( callPath + '/id', verb.update );

    app.delete( callPath + '/:id', ver.delete );
  });
});


app.listen(3000);
console.log('Listening on port 3000')
