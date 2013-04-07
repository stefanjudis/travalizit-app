define([
  'underscore',
  'backbone'
], function( _, Backbone) {
  var ChartModel = Backbone.Model.extend({

    initialize: function() {
      console.log( 'New ChartModel initialized!!!');
    }
  });

  return ChartModel;
});
