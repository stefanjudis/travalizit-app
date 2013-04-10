define([
  'jquery',
  'underscore',
  'backbone',
  'chartCollection'
], function( $, _, Backbone, Charts ) {
  var AppView = Backbone.View.extend({
    el  : '#sidebar',
    // don't want to have jshint error
    // for not defined $el variable. ;)
    $el : $( this.el ),

    events: {
      'click #addBtn' : 'createChart',
      'click #sizeBtn' : 'toggleViewSize'
    },

    initialize: function() {
      charts = new Charts();

      this.listenTo( charts, 'add', this.addChart );
    },

    addChart: function( chart ) {
      require( [ 'chartView' ], function(ChartView) {
        var view = new ChartView( chart ),
            html = view.render();

        this.$( '#chartsContainer' ).append( html );

        $( html ).css( 'height', '5em' );
      });
    },

    createChart: function() {
      console.log( 'Function: createChart' );
      charts.create();
    },

    toggleViewSize: function() {
      this.$el.toggleClass( 'minimized' );
    }
  });

  return AppView;
});
