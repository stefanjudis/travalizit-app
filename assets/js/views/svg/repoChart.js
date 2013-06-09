define([
  'underscore',
  'd3',
  'handlebars',
  'generalSVGView',
  'text!repoChartHtmlTemplate',
  'hbsAttributesHelper'
], function( _, d3, Handlebars, GeneralSVGView, RepoChartHtmlTemplate ) {
  var RepoSVGView = GeneralSVGView.extend({

    handleCircleClick: function() {
    },


    // TODO that can be refactored and be mored into general view
    renderHtmlPart : function() {
      var template = Handlebars.compile( RepoChartHtmlTemplate );

      this.$el.append(
        template(
          {
            repo : this.model.get('data').github
          }
        )
      );
    },


    renderSvg : function() {
    }

  });


  return RepoSVGView;
});
