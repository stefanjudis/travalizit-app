define([
  'underscore',
  'backbone'
], function( _, Backbone) {
  var ChartModel = Backbone.Model.extend({
    constructor: function() {
      Backbone.Model.apply(this, arguments);
    },

    parse: function(data, options) {
      var attributes = {};

      _.each( data, function( index, value ) {
        attributes[ value.name ] = value.value;
      })

      return attributes;
    },


    initialize: function( data ) {
      console.log( 'New ChartModel initialized!!!');
      _.each( data, _.bind(function( index, value) {
        this.set( value.name, value.value );
      }, this));
    }
  });

  return ChartModel;
});
