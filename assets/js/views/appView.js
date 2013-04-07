define([
  'jquery',
  'underscore',
  'backbone',
  'chartCollection',
  'chartView'
], function( $, _, Backbone, Charts, ChartView ) {
  var AppView = Backbone.View.extend({
    el  : '#sidebar',
    // don't want to have jshint error
    // for not defined $el variable. ;)
    $el : $( this.el ),

    events: {
      'click #addBtn' : 'createChart',
      'click #minimizeBtn' : 'minimizeView'
    },

    initialize: function() {
      charts = new Charts();

      this.listenTo( charts, 'add', this.addChart );
    },

    addChart: function( chart ) {
      var view = new ChartView( chart ),
          html = view.render();

      this.$( '#chartsContainer' ).append( html );

      $( html ).css( 'height', '5em' );
    },

    createChart: function() {
      console.log( 'Function: createChart' );
      charts.create();
    },

    minimizeView: function() {
      this.$el.addClass("minimized");
    }
  });

  return AppView;
});
