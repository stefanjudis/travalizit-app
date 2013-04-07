define([
  'jquery',
  'underscore',
  'backbone',
  'chartCollection',
  'chartView'
], function( $, _, Backbone, Charts, ChartView ) {
  var charts;

  var AppView = Backbone.View.extend({
    el  : '#sidebar',
    // don't want to have jshint error
    // for not defined $el variable. ;)
    $el : $( this.el ),

    events: {
      'click #addBtn' : 'createChart'
    },

    initialize: function() {
      charts = new Charts();

      this.listenTo( charts, 'add', this.addChart );
    },

    addChart: function( chart ) {
      var view = new ChartView( chart );
      debugger

      this.$el.find( '#chartsContainer' ).append( view.render() );
    },

    createChart: function() {
      console.log( 'Function: createChart' );
      charts.create();
    }
  });

  return AppView;
});
