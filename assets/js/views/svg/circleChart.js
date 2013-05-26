define([
  'underscore',
  'd3',
  'generalSVGView'

], function( _, d3, GeneralSVGView ) {
  var CircleSVGView = GeneralSVGView.extend({

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

          margin = { top: 10, right: 10, bottom: 10, left: 10 },
          width  = this.$el.width() - margin.left - margin.right,
          height = this.$el.height() - this.$( '.topBar' ).height() -  margin.top - margin.bottom,

          d3el = d3.select( this.el ),

          bubble = d3.layout.pack()
                      .padding( 1.5 )
                      .size( [ width / 2 , height ] )
                      .value( function( d ) {
                        return d.count;
                      });

      d3el.select( 'svg' ).remove();

      this.svg = d3el.append( 'svg' )
              .attr( 'width', width + margin.left + margin.right )
              .attr( 'height', height +  margin.top + margin.bottom );

      reposGroup = this.svg.append( 'g' )
                    .attr( 'class', 'repos' )
                    .attr( 'transform', 'translate(' +( width / 2 ) + ',' + margin.top + ')' )
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
                } );

      repoGroup.append('text')
                .attr( 'dy', '.3em' )
                .style( 'text-anchor', 'middle' )
                .text(
                  function( d ) {
                    return d.repo;
                  }
                );
    }


    // handleBarClick : function( event, target ) {
    //   var detailInformation = this.svg.select( '.detailInformation' ),
    //       d3Target = d3.select( target );

    //   if ( detailInformation instanceof Array && detailInformation[0][0] ) {
    //     this.hideDetailInformation( detailInformation );
    //   }

    //   this.showDetailInformation( event.offsetX, event.offsetY, target );
    // },


    // handleDetailClick : function() {
    //   this.hideDetailInformation();
    // },


    // hideDetailInformation : function( detailInformation ) {
    //   var information = detailInformation || this.svg.select( '.detailInformation' );

    //   information
    //     .selectAll( 'text' )
    //     .transition()
    //     .attr( 'font-size', '0px' );

    //   information
    //     .selectAll( 'rect' )
    //     .transition()
    //     .attr( 'height', 0 )
    //     .each( 'end', function() {
    //       this.parentNode.remove();
    //     });

    //   information
    //     .selectAll( '.arc' )
    //     .transition()
    //     .attr( 'height', 0 )
    //     .each( 'end', function() {
    //       this.parentNode.remove();
    //     });

    //   // that feels totally hacky :(
    //   this.svgBars[ 0 ].forEach( function( bar, i ) {
    //     bar.classList.remove( 'active' );
    //   } );
    // },


    // showDetailInformation : function( x, y, target ) {
    //   var width        = 240,
    //       height       = 140,
    //       xPos         = x - 80 - width / 2,
    //       yPos         = y - 20 - height / 4,
    //       svgWidth     = this.svg.attr( 'data-width' ),
    //       svgHeight    = this.svg.attr( 'data-height' ),
    //       d3Target     = d3.select( target ),
    //       date         = d3Target.attr( 'data-date' ),
    //       label        = d3Target.attr( 'data-label' ),
    //       value        = d3Target.attr( 'data-value' ),

    //       // pie stuff
    //       dayData      = this.model.get( 'data' ).filter( function( object ) {
    //                         return object.unit.match( target.dataset.date );
    //                       } )[ 0 ],
    //       circleData   = _.filter( _.map( dayData, function( value, name ) {
    //                         var returnValue = false;

    //                         if ( +value === value && name !== 'totalbuilds') {
    //                           returnValue = {
    //                             name  : name,
    //                             value : value
    //                           };
    //                         }

    //                         return returnValue;
    //                     }), function( value ) {
    //                       return value;
    //                     }),
    //       circleWidth  = 80,
    //       circleHeight = 80,
    //       radius       = Math.min( circleWidth, circleHeight) / 2,
    //       circleMargin = 15,

    //       arc,
    //       pie,
    //       pieGroup,
    //       pieValues,
    //       pieValuesAll    = 0,
    //       pieValuesLength = 0,

    //       detailInformation,
    //       detailInformationMargin = 10,

    //       /**
    //        *
    //        * HELPER FUNCTIONS FOR THE WHOLE D3 CALCULATIONS
    //        *
    //        */
    //       calculatePositionValues = function() {
    //         if ( xPos >= ( svgWidth - width - detailInformationMargin ) ) {
    //           xPos = svgWidth - width - detailInformationMargin;
    //         }

    //         if ( xPos <= 0 ) {
    //           xPos = detailInformationMargin;
    //         }

    //         // that's 'pi mal daumen' - i know
    //         if ( yPos >= ( svgHeight - height - detailInformationMargin ) ) {
    //           yPos = svgHeight - height - detailInformationMargin;
    //         }

    //         if ( yPos <= 0 ) {
    //           yPos = detailInformationMargin;
    //         }
    //       };

    //   d3Target.attr( 'class', d3Target.attr( 'class' ) + ' active' );

    //   calculatePositionValues();

    //   detailInformation = this.svg.append( 'g' )
    //                         .attr( 'class', 'detailInformation' )
    //                         .attr( 'transform', 'translate('+  xPos + ',' + yPos + ')' );


    //   detailInformation.append( 'rect' )
    //                     .attr( 'x', 0 )
    //                     .attr( 'y', 0 )
    //                     .attr( 'width', width )
    //                     .transition()
    //                     .attr( 'height', height );

    //   detailInformation.append( 'rect' )
    //                     .attr( 'class', 'closeBtnSvg' )
    //                     .attr( 'y', 0 )
    //                     .attr( 'width', 20 )
    //                     .attr( 'x', width - 20 )
    //                     .transition()
    //                     .attr( 'height', 20 )
    //                     .attr( 'data-action-click', 'handleDetailClick' );

    //   detailInformation.append( 'text' )
    //                     .attr( 'class', 'closeBtnSvgText' )
    //                     .attr( 'y', 14 )
    //                     .attr( 'x', width - 14 )
    //                     .attr( 'font-family', 'sans-serif' )
    //                     .transition()
    //                     .attr( 'font-size', '16px' )
    //                     .text( 'x' )
    //                     .attr( 'data-action-click', 'handleDetailClick' );

    //   detailInformation.append( 'text' )
    //                     .attr( 'class', 'date' )
    //                     .attr( 'x', detailInformationMargin )
    //                     .attr( 'y', detailInformationMargin * 2 )
    //                     .text( date );

    //   pieValues = detailInformation.append( 'g' )
    //                 .attr( 'class', 'donutValues' )
    //                 .selectAll( '.donutValue' )
    //                 .data( circleData )
    //                 .enter().append( 'g' )
    //                 .attr( 'class', 'donutValue' );

    //   pieValues.append( 'text' )
    //             .data( circleData )
    //             .attr( 'x', detailInformationMargin )
    //             .attr( 'y', function( d, index ) {
    //               pieValuesLength++;

    //               return 40 + index * 20;
    //             })
    //             .text( function( d ) {
    //               // NaN check
    //               if ( +d.value === +d.value ) {
    //                 pieValuesAll += +d.value;
    //               }

    //               return d.name + ': ' + d.value;
    //             });

    //   detailInformation.select( '.donutValues' )
    //           .append( 'g' )
    //           .attr( 'class', 'donutValue' )
    //           .append( 'text' )
    //           .attr( 'x', detailInformationMargin )
    //           .attr( 'y', 40 + pieValuesLength * 20 )
    //           .text( 'Over all: ' + pieValuesAll );

    //   detailInformation.append( 'rect' )
    //                     .attr( 'class', 'analyzeBtn' )
    //                     .attr( 'x', 0 )
    //                     .attr( 'y', height - 30 )
    //                     .attr( 'width', width )
    //                     .transition()
    //                     .attr( 'height', 30 );

    //   detailInformation.append( 'text' )
    //                     .attr( 'class', 'analyzeBtnText' )
    //                     .attr( 'x', detailInformationMargin )
    //                     .attr( 'y', height - 8 )
    //                     .text( 'Analyze!!!' );

    //   arc = d3.svg.arc()
    //       .outerRadius( function( ) {
    //         return ( radius + Math.floor( ( Math.random() * 10 ) ) );
    //       } )
    //       .innerRadius( 0 );

    //   pie = d3.layout.pie()
    //       .sort( null )
    //       .value( function( d ) { return d.value; } );

    //   pieGroup = detailInformation
    //         .append( 'g' )
    //         .attr( 'class', 'donutCircle' )
    //         .attr( 'transform', 'translate(' + ( width - radius - circleMargin ) + ',' + ( radius + circleMargin ) + ')' )
    //         .selectAll( '.arc' )
    //         .data( pie( circleData ) )
    //         .enter().append( 'g' )
    //         .attr( 'class', 'arc' );

    //   pieGroup.append( 'path' )
    //       .attr( 'd', arc );

    //   pieGroup.append( 'text' )
    //       .attr(
    //         'transform',
    //         function( d ) {
    //           return 'translate(' + arc.centroid( d ) + ')';
    //         }
    //       )
    //       .attr( 'class', 'donutText' )
    //       .attr( 'dy', '.35em' )
    //       .style( 'text-anchor', 'middle' )
    //       .text( function( d ) { return d.value; } );
    // }
  });


  return CircleSVGView;
});
