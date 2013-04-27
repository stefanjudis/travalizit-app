requirejs.config({
  baseUrl: 'js',
  paths: {
    jquery     : 'libs/jquery/jquery.min',
    underscore : 'libs/underscore-amd/underscore-min',
    //backbone   : 'libs/backbone-amd/backbone-min',
    backbone   : 'libs/backbone-amd/backbone',
    d3         : 'libs/d3/d3.min',
    handlebars : 'libs/require-handlebars-plugin/Handlebars',
    text       : 'libs/requirejs-text/text',

    //models
    chartModel : 'models/chartModel',

    // views
    appView      : 'views/appView',
    chartView    : 'views/chartView',
    chartSVGView : 'views/chartSVGView',

    // collections
    chartCollection : 'collections/chartsCollection',

    // templates
    chartTemplate       : 'templates/chartView.hbs',
    chartSelectTemplate : 'templates/chartSelectTemplate.hbs',
    chartParamsTemplate : 'templates/chartParamsTemplate.hbs',
    chartSvgItem        : 'templates/chartSvgItemTemplate.hbs',

    config : 'config/config'
  }
});

// Start the main app logic.
requirejs([ 'appView' ], function( AppView ) {
  var charts;

  new AppView();
});
