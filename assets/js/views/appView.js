define([
  'jquery',
  'underscore',
  'backbone',
  'config',
  'chartCollection'
], function( $, _, Backbone, Config, Charts ) {
  var AppView = Backbone.View.extend({
    el  : '#sidebar',
    // don't want to have jshint error
    // for not defined $el variable. ;)
    $el        : $( this.el ),
    $chartMenu : undefined,


    events: {
      'click #addBtn'   : 'showChartMenu',
      'click .addChart' : 'showParamMenu',
      'click #sizeBtn'  : 'toggleViewSize'
    },


    initialize: function() {
      charts = new Charts();

      this.$chartMenu = this.$el.find( '#chartSelectMenu' );

      this.listenTo( charts, 'add', this.addChart );
    },


    addChart: function( chart ) {
      require( [ 'chartView' ], function(ChartView) {
        var view = new ChartView( chart ),
            html = view.render();

        this.$( '#chartsContainer' ).append( html );
      });
    },


    createChart: function() {
      console.log( 'Function: createChart' );
      charts.create();
    },


    showChartMenu: function() {
      require(
        [ 'handlebars', 'text!chartSelectTemplate' ],
        _.bind(function( Handlebars, ChartSelectTemplate ) {
          var template = Handlebars.compile( ChartSelectTemplate ),
              html     = template({
                chartTypes : _.keys( Config.charts )
              });

          this.$chartMenu
            .html( html )
            .find( '.animationContainer' )
            .addClass( 'shown' );

        }, this )
      );
    },


    showParamMenu: function( event ) {
      require(
        [ 'handlebars', 'text!chartParamsTemplate'],
        _.bind(function( Handlebars, ChartParamsTemplate ) {
          var button   = $( event.target ),
              type     = button.data( 'type' ),
              template = Handlebars.compile( ChartParamsTemplate ),
              html     = template({
                chartParams : Config.charts[ type ].params
              });

              this.$chartMenu
                .append( html )
                .find( '#chartParams' )
                .addClass( 'shown' );

        }, this )
      );
    },

    toggleViewSize: function() {
      this.$el.toggleClass( 'minimized' );
    }
  });


  return AppView;
});
