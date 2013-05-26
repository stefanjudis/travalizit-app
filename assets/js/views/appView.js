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
      var sidebarView;

      charts = new Charts();

      this.$chartsCanvas = $( '#chartsCanvas' );

      this.listenTo( charts, 'add', this.addChart );
      this.listenTo( charts, 'activate', this.activateChartView );

      sidebarView = new SidebarView();
    },


    activateChartView : function( model ) {
      this.$chartsCanvas
          .find( '.svgChartItem' )
            .removeClass( 'active' )
          .filter( '#svgChartItem-' + model.cid )
            .addClass( 'active' );
    },


    addChart : function( chart ) {
      console.log(chart.get( 'type' ) + 'View');
      require(
        [ chart.get( 'type' ) + 'View' ],
        _.bind( function( SVGView ) {
          var SVGView      = new SVGView( chart ),
              svgHtml      = SVGView.render();

          this.$chartsCanvas.append( svgHtml );

          this.$chartsCanvas.find( '.svgChartItem' ).addClass( 'shown' );
        }, this )
      );
    }
  });

  return AppView;
});
