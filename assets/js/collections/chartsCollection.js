define([
  'underscore',
  'backbone',
  'chartModel'
], function( _, Backbone, Chart ) {
  var Charts = Backbone.Collection.extend({
    model : Chart
  });

  return Charts;
});
