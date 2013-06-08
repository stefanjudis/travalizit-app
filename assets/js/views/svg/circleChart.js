define([
  'underscore',
  'd3',
  'handlebars',
  'generalSVGView',
  'text!circleChartHtmlTemplate'
], function( _, d3, Handlebars, GeneralSVGView, CircleChartHtmlTemplate) {
  var CircleSVGView = GeneralSVGView.extend({

    handleCircleClick: function() {

    },


    renderHtmlPart : function() {
      var template = Handlebars.compile( CircleChartHtmlTemplate );

      console.log(this.model.get('data')[0].repos);
      this.$el.append(
        template(
          {
            repos : this.model.get('data')[0].repos
          }
        )
      );
    },


    renderSvg : function() {
      var data        = this.model.get( 'data' ),
          generalData = data[0].general,
          repoData    = data[0].repos,
          repoAll     = _.reduce(repoData, function(memo, value) {
            return memo + value.count;
          }, 0),
          repoNodes   = {
            name : 'repos',
            count : repoAll,
            children : repoData
          },
          reposGroup,
          repoGroup,

          margin = { top: 10, right: 10, bottom: 60, left: 10 },
          width  = ( this.$el.width() ) / 2,
          height = this.$el.height() - margin.top - margin.bottom,

          d3el = d3.select( this.el ),

          bubble = d3.layout.pack()
                      .padding( 1.5 )
                      .size( [ width, height ] )
                      .value( function( d ) {
                        return d.count;
                      });

      d3el.select( 'svg' ).remove();

      this.svg = d3el.append( 'svg' )
              .attr( 'width', width )
              .attr( 'height', height + margin.top )
              .attr( 'class', 'circleGroup' );

      reposGroup = this.svg.append( 'g' )
                    .attr( 'class', 'repos' )
                    .attr( 'transform', 'translate( 0,' + margin.top + ')' )
                    .attr( 'data-width', width )
                    .attr( 'data-height', height );

      repoGroup = reposGroup.selectAll( '.repo' )
                            .data(bubble.nodes( repoNodes ) )
                            .enter().append( 'g' )
                            .attr( 'class', 'repo' )
                            .attr(
                              'transform',
                              function( d ) {
                                return 'translate(' + d.x + ',' + d.y + ')';
                              }
                            );

      repoGroup.append( 'circle' )
                .attr(
                  'r',
                  function( d ) { return d.r; }
                )
                .attr( 'data-count', function( d ) {
                  return d.count;
                } )
                .attr( 'data-action-click', 'handleCircleClick');

      repoGroup.append('text')
                .attr( 'dy', '.3em' )
                .style( 'text-anchor', 'middle' )
                .text(
                  function( d ) {
                    return d.repo;
                  }
                )
                .attr( 'data-action-click', 'handleCircleClick' );
    }
  });


  return CircleSVGView;
});
