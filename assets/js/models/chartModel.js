define([
  'underscore',
  'backbone'
], function( _, Backbone) {
  var ChartModel = Backbone.Model.extend({
    parse : function(data, options) {
      var attributes = {};

      if ( options.xhr ) {
        attributes.data = data;
      } else {
        _.each( data, function( value ) {
          attributes[ value.name.replace( 'paramInput-', '' ) ] = value.value;
        });
      }

      return attributes;
    },


    initialize : function( data ) {
      console.log( 'New ChartModel initialized!!!');

      this.fetch({ data : $.param( this.attributes ) });
    },

  });


  return ChartModel;

});
