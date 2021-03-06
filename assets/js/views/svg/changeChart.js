define([
  'underscore',
  'd3',
  'generalSVGView',
  'config'
], function( _, d3, GeneralSVGView, Config ) {

  var ChangeSVGView = GeneralSVGView.extend({

    events: function() {
      return _.extend( {}, GeneralSVGView.prototype.events, {
          'click .fetchBuildData' : 'fetchBuildData',

          'keypress .searchInput' : 'handleSearchInput',
          'click .searchBtn'      : 'setNewGrouping'
      } );
    },


    fetchBuildData : function( event ) {
      event.target.disabled = true;
      this.$el.find( '.histogram' ).addClass( 'active' );

      $.ajax( {
        data : {
          name        : this.model.get( 'name' ),
          repoOwner   : this.model.get( 'repoOwner' ),
          repoName    : this.model.get( 'repoName' ),
          type        : this.model.get( 'type' ),
          pleaseFetch : true
        },
        error : function() {
          console.log( 'shit error' );
        },
        success : _.bind( function() {
          this.model.fetch(
            {
              data : this.model.get( 'queryParams' )
            }
          );
        }, this ),
        type : 'GET',
        url  : '/builds'
      } );
    },


    generateChartName : function() {
      var name = this.model.get( 'name' );

      name += ' for ' + this.model.get( 'repoOwner' ) + ' / '
              + this.model.get( 'repoName' );

      this.model.set( 'name', name );
    },


    handleSearchInput : function( event ) {
      if ( event.keyCode === 13 ) {
        this.renderSvg( event.target.value );
      }
    },


    render : function() {
      var html = this.$el.html(
                this.template({
                  name : this.model.get( 'name' )
                })
              ),
          data = this.model.get( 'data' );

      this.$el.css({
        height : Config.svgChartView.height,
        width  : Config.svgChartView.width
      });

      if ( data ) {
        if (
          this.renderHtmlPart &&
          typeof this.renderHtmlPart === 'function'
        ) {
          this.renderHtmlPart();
        }

        this.$el.find( '.loadingContainer' ).remove();

        if ( data.nodes.length ) {
        // if data is already fetched
          this.renderSvg();
        } else {
          require(
            [ 'handlebars', 'text!noBuildDataTemplate'],
            _.bind( function( Handlebars, NoBuildDataTemplate ) {
              var template = Handlebars.compile( NoBuildDataTemplate ),
                  html     = template( {
                    name  : this.model.get( 'repoName' ),
                    owner : this.model.get( 'repoOwner' )
                  } );

              this.$el.append( html );
            }, this )
          );
        }
      }

      return html;
    },


    renderSvg : function( grouping ) {
      var groupSize      = +grouping || 200,
          data           = this.model.getGroupedChanges( groupSize ),
          dataKeys       = Object.keys( data ),
          dataKeysPassed = dataKeys.filter( function( key ) {
            return data[ key ].passed !== 0;
          } ),
          dataKeysFailed = dataKeys.filter( function( key ) {
            return data[ key ].failed !== 0;
          } ),

          margin    = { top: 20, right: 20, bottom: 100, left: 80 },
          width     = this.$el.width() - margin.left - margin.right,
          height    = this.$el.height() - margin.top - margin.bottom,

          x = d3.scale.linear()
                .range( [ 0, width ] ),

          y = {
            passed : d3.scale.linear()
                        .range( [ height, 0 ] ),
            failed : d3.scale.linear()
                        .range( [ height, 0 ] )
          },

          xAxis = d3.svg.axis()
                    .scale( x )
                    .orient( 'bottom' ),

          yAxis = {
            passed : d3.svg.axis()
                            .scale( y.passed )
                            .orient( 'left' ),
            failed : d3.svg.axis()
                            .scale( y.failed )
                            .orient( 'left' )
          },

          line = {
            passed : d3.svg.line()
                      .x( function( d ) { return x( d ); } )
                      .y( function( d ) { return y.passed( data[ d ].passed ); } ),
            failed : d3.svg.line()
                      .x( function( d ) { return x( d ); } )
                      .y( function( d ) { return y.failed( data[ d ].failed ); } )
          },

          maxValue,
          maxValuePassed,
          maxValueFailed,
          maxValueX,

          circle = {
            radius : 8
          },

          d3el = d3.select( this.el );

      //remove old svg for example after resize
      d3el.select( 'svg' ).remove();

      //determine the max value
      maxValueX = d3.max(
                    dataKeys,
                    function( d ) { return +d; }
                  );
      maxValuePassed = d3.max(
                          dataKeys,
                          function( d ) { return data[ d ].passed; }
                        );
      maxValueFailed = d3.max(
                          dataKeys,
                          function( d ) { return data[ d ].failed; }
                        );

      maxValue = ( maxValuePassed > maxValueFailed ) ? maxValuePassed : maxValueFailed;

      this.svg = d3el.append( 'svg' )
              .attr( 'width', width + margin.left + margin.right )
              .attr( 'height', height +  margin.top + margin.bottom )
              .append( 'g' )
              .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' )
              .attr( 'data-width', width )
              .attr( 'data-height', height );

      x.domain( [ 0, +dataKeys[ dataKeys.length - 1 ] ] );
      y.passed.domain( [ 0, maxValue ] );
      y.failed.domain( [ 0, maxValue ] );

      this.svg.append( 'g' )
          .attr( 'class', 'x axis' )
          .attr( 'transform', 'translate(0,' + height + ')' )
          .call( xAxis )
          .append( 'text' )
          .attr( 'class', 'label' )
          .attr( 'x', width )
          .attr( 'y', -6 )
          .style( 'text-anchor', 'end' )
          .text( 'Changed lines of code' );

      this.svg.append( 'g' )
          .attr( 'class', 'y axis passed' )
          .call( yAxis.passed )
          .append( 'text' )
          .attr( 'transform', 'rotate(-90)' )
          .attr( 'y', 6 )
          .attr( 'dy', '-4em' )
          .style( 'text-anchor', 'end' )
          .text( 'Number of passed / failed builds' );

      this.svg.append( 'path' )
              .datum( dataKeysPassed )
              .attr( 'class', 'line passed' )
              .attr( 'd', line.passed );

      this.svg.append( 'path' )
              .datum( dataKeysFailed )
              .attr( 'class', 'line failed' )
              .attr( 'd', line.failed );
    },


    setNewGrouping : function() {
      this.renderSvg( this.$el.find( '.searchInput' ).val() );
    }
  });


  return ChangeSVGView;
});
