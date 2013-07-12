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
    sidebarView  : 'views/sidebarView',

    // svg views
    generalSVGView  : 'views/svg/generalView',

    // specific svg views
    barChartView    : 'views/svg/barChart',
    circleChartView : 'views/svg/circleChart',
    repoChartView   : 'views/svg/repoChart',
    jobChartView    : 'views/svg/jobChart',

    // collections
    chartCollection : 'collections/chartsCollection',

    // templates
    chartTemplate       : 'templates/chartView.hbs',
    chartSelectTemplate : 'templates/chartSelectTemplate.hbs',
    chartSvgItem        : 'templates/chartSvgItemTemplate.hbs',

    // particular html part svg chart templates
    circleChartHtmlTemplate : 'templates/partHtml/circleChart.hbs',
    repoChartHtmlTemplate   : 'templates/partHtml/repoChart.hbs',
    jobChartHtmlTemplate    : 'templates/partHtml/jobChart.hbs',

    // params templates
    chartParamsTemplate : 'templates/params/chartParamsTemplate.hbs',

    // message template
    noBuildDataTemplate : 'templates/messages/noBuildData.hbs',

    // helpers
    hbsInputHelper      : 'helpers/hbsInputHelper',
    hbsAttributesHelper : 'helpers/hbsAttributesHelper',

    config : 'config/config'
  },
  shim : {
    d3         : {
      exports : 'd3'
    }
  }
});

// Start the main app logic.
requirejs([ 'appView', 'd3' ], function( AppView, d3 ) {
  var charts;

  new AppView();
});
