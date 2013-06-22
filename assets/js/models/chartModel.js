define([
  'underscore',
  'backbone'
], function( _, Backbone) {
  var ChartModel = Backbone.Model.extend({
    defaults : {
      name  : 'Super fancy chart',
      error : {
        message : 'Sh⚠☹☠... something crashed.\n' +
                  'If you would like to know what happened and/or\n ' +
                  'see the graph for your request, ' +
                  'please contact me at ' +
                  '<a href="https://twitter.com/stefanjudis">Twitter</a>\n ' +
                  'or ' +
                  'write me an ' +
                  '<a href="mailto:stefanjudis@gmail.com">email</a>.'
      }
    },

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
