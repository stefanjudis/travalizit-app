define([
  'underscore',
  'backbone',
  'handlebars',
  'text!chartTemplate'
], function( _, Backbone, Handlebars, ChartTemplate ) {

  var ChartView = Backbone.View.extend({
    tagName: 'li',
    className: 'chartItem',

    events: {
      'click button' : 'deleteChart'
    },

    initialize: function( chart ) {
      this.model = chart;

      this.listenTo( this.model, 'destroy', this.remove );
    },

    render: function() {
      this.$el.html( Handlebars.compile( ChartTemplate ) );

      return this.el;
    },

    deleteChart: function() {
      this.model.destroy();
    }
  });

  return ChartView;
});
