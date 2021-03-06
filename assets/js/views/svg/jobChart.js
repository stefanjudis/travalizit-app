define([
  'underscore',
  'd3',
  'handlebars',
  'generalSVGView',
  'text!jobChartHtmlTemplate',
  'config'
], function( _, d3, Handlebars, GeneralSVGView, JobChartHtmlTemplate, Config ) {
  var JobSVGView = GeneralSVGView.extend({
    events: function() {
      return _.extend( {}, GeneralSVGView.prototype.events, {
          'click .addChart'       : 'addJobChart',
          'click .fetchBuildData' : 'fetchBuildData'
      } );
    },

    addJobChart : function() {
      require(
        [ 'repoModel', 'config' ],
        _.bind(function( ChartModel, Config ) {
          var type        = 'repoChart',
              chartConfig = _.find( Config.charts, function( chart ) {
                              return chart.type === type;
                            }),
              name        = this.model.get( 'repoName' ),
              owner       = this.model.get( 'repoOwner' ),
              data        = [
                {
                  name  : 'paramInput-type',
                  value : type
                },
                {
                  name  : 'config',
                  value : {
                    icon: chartConfig.icon
                  }
                },
                {
                  name  : 'name',
                  value : chartConfig.name
                },
                {
                  name  : 'repoName',
                  value : name
                },
                {
                  name  : 'repoOwner',
                  value : owner
                }
              ],
              chart;

          chart = new ChartModel(
                        data,
                        {
                          parse : true,
                          url   : chartConfig.url
                        }
                      );

          charts.push( chart );
        }, this)
      );
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

      name += ' for ' + this.model.get( 'repoOwner' ) + ' / ' +
              this.model.get( 'repoName' );

      this.model.set( 'name', name );
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

        if ( data.builds.length ) {
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


    // TODO that can be refactored and be mored into general view
    renderHtmlPart : function() {
      var template = Handlebars.compile( JobChartHtmlTemplate );

      this.$el.append(
        template()
      );
    },


    renderSvg : function() {
      var margin = { top: 20, right: 20, bottom: 100, left: 80 },
          width  = this.$el.width() - margin.left - margin.right,
          height = this.$el.height() - margin.top - margin.bottom,

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

          data   = this.model.get( 'data' ),
          builds = data.builds,

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

      // store it for later at detailInformation
      this.svgWidth  = width;
      this.svgHeight = height;

      x.domain( builds.map( function( d ) { return d[ Object.keys( d )[ 0 ] ].number; } ) );
      y.domain( [ 0, data.maxDuration ] );

      this.svg.append( 'g' )
          .attr( 'class', 'x axis' )
          .attr( 'transform', 'translate(0,' + height + ')' )
          .call( xAxis )
          .selectAll( 'text' )
          .attr( 'dy', '0.5em' );

      this.svg.append( 'g' )
          .attr( 'class', 'y axis' )
          .call( yAxis )
          .append( 'text' )
          .attr( 'transform', 'rotate(-90)' )
          .attr( 'y', 6 )
          .attr( 'dy', '-4em' )
          .style( 'text-anchor', 'end' )
          .text( 'Duration in milliseconds' );

      this.svgBarsContainer = this.svg.append( 'g' )
                                  .attr( 'class', 'bars' );

      builds.forEach( _.bind(function( build ) {
        var buildId  = Object.keys( build )[ 0 ],
            currentX = d3.scale.ordinal()
                              .rangeRoundBands( [ 0, ( x.rangeBand() ) ], 0.1 ),
            jobs     = build[ buildId ].jobs,
            number   = build[ buildId ].number;

        currentX.domain(
          jobs.map( function( d ) { return d.number; } ) );

        var svgBars = this.svgBarsContainer.append( 'g' )
                          .attr( 'class', 'bars-' + number )
                          .attr(
                            'transform', 'translate( ' + x( number ) + ', 0 )'
                          )
                          .selectAll( '.bar-' + number )
                          .data( jobs )
                          .enter()
                          .append( 'rect' )
                          .attr( 'x', function( d ) {
                            return currentX( d.number );
                          } )
                          .attr( 'y', function( d ) {
                            return y( d.duration );
                          } )
                          .attr( 'width', function( d ) {
                            return currentX.rangeBand();
                          } )
                          .attr(
                            'height',
                            function( d ) {
                              return height - y( d.duration );
                            }
                          )
                          .attr( 'class', function( d ) {
                            return 'bar-job-' + d.number + ' bar ' + d.state;
                          } )
                          .attr( 'data-duration', function( d ) {
                            return d.duration;
                          } )
                          .on( 'mouseover', _.bind( function( d ) {
                            this.showDetailInformation( d );
                          }, this ) )
                          .on(
                            'mouseleave',
                            _.bind( this.hideDetailInformation, this )
                          );


      }, this ) );
    },


    hideDetailInformation : function() {
      this.svg.selectAll( '.detailInformation' ).remove();
    },


    showDetailInformation : function( job ) {
      console.log( 'showDetailInformation' );
      // remove it just for safety reasons
      this.svg.selectAll( '.detailInformation' ).remove();

      var width  = 200,
          height = 80;

      var detailInformation = this.svg.append( 'g' )
                                .attr( 'class', 'detailInformation jobs' )
                                .attr(
                                  'transform',
                                  'translate( ' + ( this.svgWidth - width ) + ', ' + '0 )'
                                );

      detailInformation.append( 'rect' )
                        .attr( 'width' , width )
                        .attr( 'height', height );

      detailInformation.append( 'text' )
                        .text( 'JobId: ' + job.id )
                        .attr( 'class', 'jobHeadline' )
                        .attr( 'x', 10 )
                        .attr( 'y', 20 );

      detailInformation.append( 'rect' )
                        .attr( 'class', 'divider' )
                        .attr( 'width', width - 20 )
                        .attr( 'height', 1 )
                        .attr( 'x', 10 )
                        .attr( 'y', 25 );

      detailInformation.append( 'text' )
                        .text( 'Duration: ' + job.duration + ' ms' )
                        .attr( 'class', 'jobHeadline' )
                        .attr( 'x', 10 )
                        .attr( 'y', 40 );

      detailInformation.append( 'text' )
                        .text( 'State: ' + job.state )
                        .attr( 'class', 'jobHeadline' )
                        .attr( 'x', 10 )
                        .attr( 'y', 55 );

      detailInformation.append( 'text' )
                        .text( function() {
                          var text     = 'Language: ',
                              language,
                              version;

                          if ( job.config.language ) {
                            if ( job.config.language === 'ruby' ) {
                              language = 'ruby';
                              version  = job.config.rvm;
                            } else if (
                              job.config.language === 'c' ||
                              job.config.language === 'cpp'
                            ) {
                              language = job.config.language;
                              version  = job.config.compiler;
                            } else if ( job.config.language === 'java' ) {
                              language = 'java';
                              version  = job.config.jdk;
                            } else {
                              language = job.config.language;
                              version  = job.config[ job.config.language ];
                            }
                          } else {
                            if ( job.config.rvm ) {
                              language = 'rvm';
                              version  = job.config.rvm;
                            }
                          }

                          language = language || 'N/A';
                          version  = version  || 'N/A';

                          text += language + ' ' + version;

                          return text;
                        } )
                        .attr( 'class', 'jobHeadline' )
                        .attr( 'x', 10 )
                        .attr( 'y', 70 );
    }
  });


  return JobSVGView;
});
