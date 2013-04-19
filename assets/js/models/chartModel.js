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
      this.fetch({ data : this.getQueryParams() });
    },

    getQueryParams : function() {
      // filter config params
      var queryParams = $.param(
                          _.omit( this.attributes, 'config' )
                        );

      return queryParams;
    }
  });


  return ChartModel;

});
