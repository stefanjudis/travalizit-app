define([
  'jquery',
  'underscore',
  'backbone',
  'config',
  'chartCollection',
  'sidebarView'
], function( $, _, Backbone, Config, Charts, SidebarView ) {
  var AppView = Backbone.View.extend({
    el  : 'body',
    // don't want to have jshint error
    // for not defined $el variable. ;)
    $el          : $( this.el ),

    events : {
    },


    initialize : function() {
      charts = new Charts();

      this.$chartsCanvas = $( '#chartsCanvas' );

      this.listenTo( charts, 'add', this.addChart );

      new SidebarView();
    },


    addChart : function( chart ) {
      require(
        [ 'chartSVGView' ],
        _.bind( function( ChartSVGView ) {
          var SVGView      = new ChartSVGView( chart ),
              svgHtml      = SVGView.render();

          this.$chartsCanvas.append( svgHtml );

          this.$chartsCanvas.find( '.svgChartItem' ).addClass( 'shown' );
        }, this )
      );
    }
  });

  return AppView;
});
