define([
  'underscore',
  'backbone'
], function( _, Backbone) {
  var ChartModel = Backbone.Model.extend({
    constructor : function() {
      Backbone.Model.apply(this, arguments);
    },

    parse : function(data, options) {
      var attributes = {};

      _.each( data, function( value ) {
        attributes[ value.name.replace( 'paramInput-', '' ) ] = value.value;
      });

      return attributes;
    },


    initialize : function( data ) {
      console.log( 'New ChartModel initialized!!!');

      this.fetch({ data : $.param( this.attributes ) });
    }
  });

  return ChartModel;
});
