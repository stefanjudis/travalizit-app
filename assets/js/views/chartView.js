define([
  'underscore',
  'backbone',
  'handlebars',
  'text!chartTemplate'
], function( _, Backbone, Handlebars, ChartTemplate ) {

  var ChartView = Backbone.View.extend({
    tagName: 'li',
    className: 'chartItem',

    template: Handlebars.compile( ChartTemplate ),

    events: {
      'click button' : 'deleteChart'
    },

    initialize: function( chart ) {
      this.model = chart;

      this.listenTo( this.model, 'destroy', this.remove );
    },

    render: function() {
      this.$el.html( this.template( { id : this.model.cid } ) );

      return this.el;
    },

    deleteChart: function() {
      this.$el.height( 0 );

      this.model.destroy();
    }
  });

  return ChartView;
});
