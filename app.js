/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var express  = require( 'express' ),
    app      = express(),
    hbs      = require('express-hbs');



app.set( 'view engine', 'hbs' );
app.engine(
  'hbs', hbs.express3(
    {
      partialsDir : __dirname + '/lib/views/partials'
    }
  )
);
app.set( 'views', __dirname + '/lib/views' );

app.use(express.static(__dirname + '/assets'));


app.get( '/',  function( req, res ){
  res.render( 'index', {
    title  : 'ravalizit'
  });
});

app.listen(3000);
console.log('Listening on port 3000')
