define([
  'underscore',
  'backbone',
  'chartTemplate'
], function( _, Backbone, ChartTemplate ) {

  var ChartView = Backbone.View.extend({
    tagName: 'li',

    events: {
    },

    initialize: function( chart ) {
      this.model = chart;

      this.className = 'chart-' + this.cid;
    },

    render: function() {

    }
  });

  return ChartView;
});
