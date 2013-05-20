define([
  'underscore',
  'backbone',
  'handlebars',
  'd3',
  'text!chartSvgItem',
  'config'

], function( _, Backbone, Handlebars, d3, ChartSvgItem, Config ) {

  var ChartSVGView = Backbone.View.extend({
    className : 'svgChartItem active',

    template : Handlebars.compile( ChartSvgItem ),

    events : {
      'click' : 'triggerActiveModel',

      'click .closeBtn'     : 'deleteChart',

      'click svg'           : 'handleSvgClick',

      'blur h3'             : 'handleNameChange',

      'mousedown  .changeSizeBtn' : 'handleMouseDownViewSize',
      'mouseup    .changeSizeBtn' : 'handleMouseUpViewSize',
      'mouseleave .changeSizeBtn' : 'handleMouseLeaveViewSize',

      'mousedown .moveBtn' : 'handleMouseDownMove',
      'mouseup   .moveBtn' : 'handleMouseUpMove',

      'mouseleave' : 'handleMouseLeaveView'
    },


    initialize : function( chart ) {
      this.model = chart;

      this.$el.attr({
        id        : 'svgChartItem-' + this.model.cid
      });

      this.listenTo( this.model, 'destroy', this.remove );
      this.listenTo( this.model, 'sync', this.render );
      this.listenTo( this.model, 'change:highlighted', this.handleModelHighlight );
    },


    render : function() {
      var html = this.$el.html(
                this.template({
                  name : this.model.get( 'name' )
                })
              );

      // if data is already fetched
      if ( this.model.get( 'data' ) ) {
        this.renderSvg();
      }

      return html;
    },


    renderSvg : function() {
      var margin = { top: 20, right: 20, bottom: 30, left: 80 },
          width  = this.$el.width() - margin.left - margin.right,
          height = this.$el.height() - this.$( '.topBar' ).height() -  margin.top - margin.bottom,

          formatPercent = d3.format( '.0%' ),

          x = d3.scale.ordinal()
                .rangeRoundBands( [ 0, ( width ) ], 0.1 ),

          y = d3.scale.linear()
                .range( [ height, 0 ] ),

          xAxis = d3.svg.axis()
                    .scale( x )
                    .orient( 'bottom' ),

          yAxis = d3.svg.axis()
                    .scale( y )
                    .orient( 'left' ),

          data = this.model.get( 'data' ),

          d3el = d3.select( this.el );

      //remove old svg for example after resize
      d3el.select( 'svg' ).remove();

      this.svg = d3el.append( 'svg' )
              .attr( 'width', width + margin.left + margin.right )
              .attr( 'height', height +  margin.top + margin.bottom )
              .append( 'g' )
              .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' )
              .attr( 'data-width', width )
              .attr( 'data-height', height );

      x.domain( data.map( function( d ) { return d.unit.substring( 0, 10 ); } ) );
      y.domain( [ 0, d3.max( data, function( d ) { return d.totalbuilds; } ) ] );

      this.svg.append( 'g' )
          .attr( 'class', 'x axis' )
          .attr( 'transform', 'translate(0,' + height + ')' )
          .call( xAxis );

      this.svg.append( 'g' )
          .attr( 'class', 'y axis' )
          .call( yAxis )
          .append( 'text' )
          .attr( 'transform', 'rotate(-90)' )
          .attr( 'y', 6 )
          .attr( 'dy', '-4em' )
          .style( 'text-anchor', 'end' )
          .text( 'Builds' );

      this.svgBarsContainer = this.svg.append( 'g' )
                                .attr( 'class', 'bars' );

      this.svgBars = this.svgBarsContainer.selectAll( '.bar' )
                        .data( data )
                        .enter().append( 'rect' )
                        .attr( 'class', 'bar' )
                        .attr( 'x', function( d ) { return x( d.unit ); } )
                        .attr( 'width', x.rangeBand() )
                        .attr( 'y', function( d ) { return y( d.totalbuilds ); } )
                        .attr( 'data-action-click', 'handleBarClick' )
                        .transition()
                        .attr(
                          'height',
                          function( d ) {
                            return height - y( d.totalbuilds );
                          }
                        )
                        .attr( 'data-label', 'Count' )
                        .attr(
                          'data-value',
                          function( d ) {
                            return d.totalbuilds;
                          }
                        )
                        .attr(
                          'data-date',
                          function( d ) {
                            return d.unit.substr( 0, 10 );
                          }
                        );

      this.svgSuccessBars = this.svgBarsContainer.selectAll( '.successBar' )
                              .data( data )
                              .enter().append( 'rect' )
                              .attr( 'class', 'successBar' )
                              .attr( 'x', function( d ) { return x( d.unit ); } )
                              .attr( 'width', x.rangeBand() )
                              .attr( 'y', function( d ) { return y( d.successful ); } )
                              .attr( 'data-action-click', 'handleBarClick' )
                              .transition()
                              .attr(
                                'height',
                                function( d ) {
                                  return height - y( d.successful );
                                }
                              )
                              .attr( 'data-label', 'Count' )
                              .attr(
                                'data-value',
                                function( d ) {
                                  return d.successful;
                                }
                              )
                              .attr(
                                'data-date',
                                function( d ) {
                                  return d.unit.substr( 0, 10 );
                                }
                              );

      this.svgSuccessStars = this.svgBarsContainer.selectAll( '.successStar' )
                              .data( data )
                              .enter().append( 'text' )
                              .attr( 'class', 'successStar' )
                              .attr( 'x', function( d ) { return x( d.unit ) + x.rangeBand() / 2  - 12; } )
                              .attr(
                                'y',
                                function( d ) {
                                  var yPos = y( d.successful );

                                  // adding half font size as well
                                  return yPos + ( height - yPos ) / 2 + 12 ;
                                }
                              )
                              .attr( 'data-action-click', 'handleBarClick' )
                              .text(
                                function( d ) {
                                  var returnValue = '';

                                  if ( ( height - y( d.successful ) ) > 26 ) {
                                    returnValue = '☆';
                                  }

                                  return returnValue;
                                }

                              )
                              .attr( 'data-label', 'Count' )
                              .attr(
                                'data-value',
                                function( d ) {
                                  return d.successful;
                                }
                              )
                              .attr(
                                'data-date',
                                function( d ) {
                                  return d.unit.substr( 0, 10 );
                                }
                              );
    },


    deleteChart : function() {
      this.model.destroy();
    },


    handleModelHighlight : function( model, highlighted ) {
      if ( highlighted ) {
        this.$el.addClass( 'highlighted' );
      } else {
        this.$el.removeClass( 'highlighted' );
      }
    },


    handleBarClick : function( event, target ) {
      var detailInformation = this.svg.select( '.detailInformation' ),
          d3Target = d3.select( target );

      if ( detailInformation instanceof Array && detailInformation[0][0] ) {
        this.hideDetailInformation( detailInformation );
      }

      this.showDetailInformation( event.offsetX, event.offsetY, target );
    },


    handleNameChange : function( event ) {
      this.model.set( 'name', event.target.innerText );
    },


    handleSvgClick : function( event ) {
      var target     = event.target,
          attributes = target.attributes,
          action;

      try {
        action = attributes.getNamedItem( 'data-action-click' ).value;
      } catch( e ) {}

      if ( action && this[ action ] && typeof this[ action ] === 'function' ) {
        this[ action ]( event, target );
      }
    },


    handleDetailClick : function() {
      this.hideDetailInformation();
    },


    handleMouseDownMove : function( e ) {
      var dragHeight = this.$el.outerHeight(),
          dragWidth  = this.$el.outerWidth(),
          dragOffset = this.$el.offset(),
          posY       = dragOffset.top + dragHeight - e.pageY,
          posX       = dragOffset.left + dragWidth - e.pageX;

      this.$el.addClass( 'draggable' );

      this.$el.on( 'mousemove', _.bind( function(e) {
        if ( this.$el.hasClass( 'draggable' ) ) {
          this.$el.offset({
            top  : e.pageY + posY - dragHeight,
            left : e.pageX + posX - dragWidth
          });
        }
      }, this ) );

      e.preventDefault();
    },


    handleMouseDownViewSize : function( e ) {
      var changeSizeBtn = this.$changeSizeBtn || this.$( '.changeSizeBtn' ),
          dragHeight    = this.$el.outerHeight(),
          dragWidth     = this.$el.outerWidth(),
          dragOffset    = this.$el.offset();

      // save it for later
      this.$changeSizeBtn = changeSizeBtn;

      changeSizeBtn.addClass( 'draggable' );

      changeSizeBtn.on( 'mousemove', _.bind( function(e) {
        if ( changeSizeBtn.hasClass( 'draggable' ) ) {
          this.$el.css({
            width  : dragWidth + e.pageX - ( dragWidth + dragOffset.left ) - this.$changeSizeBtn.width() / 2,
            height : dragHeight + e.pageY - ( dragHeight + dragOffset.top ) + this.$changeSizeBtn.height() / 2
          })
        }
      }, this ) );

      e.preventDefault();
    },


    handleMouseLeaveView : function( e ) {
      this.$el.removeClass( 'draggable' );
    },


    handleMouseLeaveViewSize : function( e ) {
      // don't touch dom when there is no need to
      if (
        this.$changeSizeBtn &&
        this.$changeSizeBtn.hasClass( 'draggable' )
      ) {
        this.$changeSizeBtn.removeClass( 'draggable' );
      }
    },


    handleMouseUpViewSize : function( e ) {
      if (
        this.$changeSizeBtn &&
        this.$changeSizeBtn.hasClass( 'draggable' )
      ) {
        this.$changeSizeBtn.removeClass( 'draggable' );
      }

      this.renderSvg();
    },


    handleMouseUpMove : function( e ) {
      this.$el.removeClass( 'draggable' );
    },


    hideDetailInformation : function( detailInformation ) {
      var information = detailInformation || this.svg.select( '.detailInformation' );

      information
        .selectAll( 'text' )
        .transition()
        .attr( 'font-size', '0px' );

      information
        .selectAll( 'rect' )
        .transition()
        .attr( 'height', 0 )
        .each( 'end', function() {
          this.parentNode.remove();
        });

      information
        .selectAll( '.arc' )
        .transition()
        .attr( 'height', 0 )
        .each( 'end', function() {
          this.parentNode.remove();
        });

      // that feels totally hacky :(
      this.svgBars[ 0 ].forEach( function( bar, i ) {
        bar.classList.remove( 'active' );
      } );
    },


    remove : function() {
      this.$el.addClass( 'removed' )
              .on(
                'animationend webkitAnimationEnd otransitionend',
                _.bind( function() {
                  this.$el.remove();
                }, this )
              );
    },


    showDetailInformation : function( x, y, target ) {
      var width        = 240,
          height       = 140,
          xPos         = x - 80 - width / 2,
          yPos         = y - 20 - height / 4,
          svgWidth     = this.svg.attr( 'data-width' ),
          svgHeight    = this.svg.attr( 'data-height' ),
          d3Target     = d3.select( target ),
          date         = d3Target.attr( 'data-date' ),
          label        = d3Target.attr( 'data-label' ),
          value        = d3Target.attr( 'data-value' ),

          // pie stuff
          dayData      = this.model.get( 'data' ).filter( function( object ) {
                            return object.unit.match( target.dataset.date );
                          } )[ 0 ],
          circleData   = _.filter( _.map( dayData, function( value, name ) {
                            var returnValue = false;

                            if ( +value === value && name !== 'totalbuilds') {
                              returnValue = {
                                name  : name,
                                value : value
                              };
                            }

                            return returnValue;
                        }), function( value ) {
                          return value;
                        }),
          circleWidth  = 80,
          circleHeight = 80,
          radius       = Math.min( circleWidth, circleHeight) / 2,
          circleMargin = 15,

          arc,
          pie,
          pieGroup,
          pieValues,
          pieValuesAll    = 0,
          pieValuesLength = 0,

          detailInformation,
          detailInformationMargin = 10,

          /**
           *
           * HELPER FUNCTIONS FOR THE WHOLE D3 CALCULATIONS
           *
           */
          calculatePositionValues = function() {
            if ( xPos >= ( svgWidth - width - detailInformationMargin ) ) {
              xPos = svgWidth - width - detailInformationMargin;
            }

            if ( xPos <= 0 ) {
              xPos = detailInformationMargin;
            }

            // that's 'pi mal daumen' - i know
            if ( yPos >= ( svgHeight - height - detailInformationMargin ) ) {
              yPos = svgHeight - height - detailInformationMargin;
            }

            if ( yPos <= 0 ) {
              yPos = detailInformationMargin;
            }
          };

      d3Target.attr( 'class', d3Target.attr( 'class' ) + ' active' );

      calculatePositionValues();

      detailInformation = this.svg.append( 'g' )
                            .attr( 'class', 'detailInformation' )
                            .attr( 'transform', 'translate('+  xPos + ',' + yPos + ')' );


      detailInformation.append( 'rect' )
                        .attr( 'x', 0 )
                        .attr( 'y', 0 )
                        .attr( 'width', width )
                        .transition()
                        .attr( 'height', height );

      detailInformation.append( 'rect' )
                        .attr( 'class', 'closeBtnSvg' )
                        .attr( 'y', 0 )
                        .attr( 'width', 20 )
                        .attr( 'x', width - 20 )
                        .transition()
                        .attr( 'height', 20 )
                        .attr( 'data-action-click', 'handleDetailClick' );

      detailInformation.append( 'text' )
                        .attr( 'class', 'closeBtnSvgText' )
                        .attr( 'y', 14 )
                        .attr( 'x', width - 14 )
                        .attr( 'font-family', 'sans-serif' )
                        .transition()
                        .attr( 'font-size', '16px' )
                        .text( 'x' )
                        .attr( 'data-action-click', 'handleDetailClick' );

      detailInformation.append( 'text' )
                        .attr( 'class', 'date' )
                        .attr( 'x', detailInformationMargin )
                        .attr( 'y', detailInformationMargin * 2 )
                        .text( date );

      pieValues = detailInformation.append( 'g' )
                    .attr( 'class', 'donutValues' )
                    .selectAll( '.donutValue' )
                    .data( circleData )
                    .enter().append( 'g' )
                    .attr( 'class', 'donutValue' );

      pieValues.append( 'text' )
                .data( circleData )
                .attr( 'x', detailInformationMargin )
                .attr( 'y', function( d, index ) {
                  pieValuesLength++;

                  return 40 + index * 20;
                })
                .text( function( d ) {
                  // NaN check
                  if ( +d.value === +d.value ) {
                    pieValuesAll += +d.value;
                  }

                  return d.name + ': ' + d.value;
                });

      detailInformation.select( '.donutValues' )
              .append( 'g' )
              .attr( 'class', 'donutValue' )
              .append( 'text' )
              .attr( 'x', detailInformationMargin )
              .attr( 'y', 40 + pieValuesLength * 20 )
              .text( 'Over all: ' + pieValuesAll );

      detailInformation.append( 'rect' )
                        .attr( 'class', 'analyzeBtn' )
                        .attr( 'x', 0 )
                        .attr( 'y', height - 30 )
                        .attr( 'width', width )
                        .transition()
                        .attr( 'height', 30 );

      detailInformation.append( 'text' )
                        .attr( 'class', 'analyzeBtnText' )
                        .attr( 'x', detailInformationMargin )
                        .attr( 'y', height - 8 )
                        .text( 'Analyze!!!' );

      arc = d3.svg.arc()
          .outerRadius( function( ) {
            return ( radius + Math.floor( ( Math.random() * 10 ) ) );
          } )
          .innerRadius( 0 );

      pie = d3.layout.pie()
          .sort( null )
          .value( function( d ) { return d.value; } );

      pieGroup = detailInformation
            .append( 'g' )
            .attr( 'class', 'donutCircle' )
            .attr( 'transform', 'translate(' + ( width - radius - circleMargin ) + ',' + ( radius + circleMargin ) + ')' )
            .selectAll( '.arc' )
            .data( pie( circleData ) )
            .enter().append( 'g' )
            .attr( 'class', 'arc' );

      pieGroup.append( 'path' )
          .attr( 'd', arc );

      pieGroup.append( 'text' )
          .attr(
            'transform',
            function( d ) {
              return 'translate(' + arc.centroid( d ) + ')';
            }
          )
          .attr( 'class', 'donutText' )
          .attr( 'dy', '.35em' )
          .style( 'text-anchor', 'middle' )
          .text( function( d ) { return d.value; } );
    },


    triggerActiveModel : function() {
      this.model.trigger( 'activate', this.model );
    }
  });

  return ChartSVGView;
});
