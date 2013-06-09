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
      var data          = this.model.get( 'data' ),

          margin = { top: 10, right: 10, bottom: 60, left: 10 },
          width  = ( this.$el.width() ) * 0.6,
          height = this.$el.height() - margin.top - margin.bottom,

          node = {
            width  : 120,
            height : 20
          },

          d3el = d3.select( this.el ),

          nodesGroup,
          nodeGroup,
          linksGroup,
          linkGroup,

          nodes,
          links;

      function calculateNodePositions( nodes ) {
        var index = {
          build : 0,
          file  : 0
        };

        nodes.forEach( function( value ) {
          value.x = ( value.type === 'build') ? 0 : ( width - node.width - margin.right ),
          value.y = ( node.height + 5 ) * index[ value.type ];

          ++index[ value.type ];
        } );

        return nodes;
      }

      function calculateNodePaths( links, nodes ) {
        links.forEach( function( link ) {
          var sourceNode = nodes.filter(
                              function( node ) {
                                return node.name === link.source;
                              }
                            )[ 0 ],
              targetNode = nodes.filter(
                              function( node ) {
                                return node.name === link.target;
                              }
                            )[ 0 ],
              offsetX = node.width / 2,
              offsetY = node.height / 2;

          link.sourceX = sourceNode.x + offsetX;
          link.sourceY = sourceNode.y + offsetY;

          link.targetX = targetNode.x + offsetX;
          link.targetY = targetNode.y + offsetY;
        } );

        return links;
      }

      nodes = calculateNodePositions( data.nodes ),
      links = calculateNodePaths( data.links, data.nodes );

      d3el.select( 'svg' ).remove();

      this.svg = d3el.append( 'svg' )
              .attr( 'width', width )
              .attr( 'height', height + margin.top );

      linksGroup = this.svg.append( 'g' )
                            .attr( 'class', 'links' )
                            .attr( 'transform', 'translate( 0, 40 )');

      linkGroup = linksGroup.selectAll( 'link' )
                            .data( links)
                            .enter().append( 'path' )
                            .attr( 'class', 'link' )
                            .attr( 'd', function( d ) {
                              return 'M' + d.sourceX + ' ' + d.sourceY +
                                      ' L ' + d.targetX + ' ' + d.targetY;
                            } );

      nodesGroup = this.svg.append( 'g' )
                            .attr( 'class', 'nodes' )
                            .attr( 'transform', 'translate( 0, 40 )');

      nodeGroup = nodesGroup.selectAll( '.node' )
                    .data( nodes )
                    .enter().append( 'g' )
                    .attr( 'class', 'node' )
                    .attr(
                      'transform',
                      function( d ) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                      }
                    );

      nodeGroup.append( 'rect' )
                .attr( 'height', node.height )
                .attr( 'width', node.width );

      nodeGroup.append('text')
                .attr( 'x', '5' )
                .attr( 'y', '15' )
                .text(
                  function( d ) {
                    return d.name;
                  }
                );

      console.log(nodes);
      console.log(links);
    }
  });


  return RepoSVGView;
});
