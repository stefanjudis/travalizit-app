define([
  'underscore',
  'backbone',
  'handlebars',
  'd3',
  'text!chartSvgItem'

], function( _, Backbone, Handlebars, d3, ChartSvgItem ) {

  var ChartSVGView = Backbone.View.extend({
    className : 'svgChartItem',

    template : Handlebars.compile( ChartSvgItem ),

    events : {
      'click button' : 'deleteChart'
    },


    initialize : function( chart ) {
      this.model = chart;

      this.listenTo( this.model, 'destroy', this.remove );
    },


    render : function() {
      return this.$el.html(
        this.template()
      );
    },


    deleteChart : function() {
      this.model.destroy();
    },


    remove : function() {
      this.$el.addClass( 'removed' )
              .on(
                'animationend webkitAnimationEnd otransitionend',
                _.bind( function() {
                  this.$el.remove();
                }, this )
              );
    }

  });

  return ChartSVGView;
});
