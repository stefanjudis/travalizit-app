define([
  'underscore',
  'd3',
  'handlebars',
  'chartModel',
  'generalSVGView',
  'text!repoChartHtmlTemplate',
  'config',
  'hbsAttributesHelper'
], function( _, d3, Handlebars, ChartModel, GeneralSVGView, RepoChartHtmlTemplate, Config ) {
  var RepoSVGView = GeneralSVGView.extend({
    events: function() {
      return _.extend( {}, GeneralSVGView.prototype.events, {
          'click .addChart'       : 'addJobChart',
          'click .fetchBuildData' : 'fetchBuildData',
          'click .showAttributes' : 'toggleAttributes'
      } );
    },


    initialize : function( chart ) {
      this.model = chart;

      this.$el.attr({
        id        : 'svgChartItem-' + this.model.cid
      });

      this.$el.addClass( 'fontawesome-' + this.model.get( 'config' ).icon );

      this.listenTo( this.model, 'destroy', this.remove );
      this.listenTo( this.model, 'sync', this.render );
      this.listenTo( this.model, 'change:highlighted', this.handleModelHighlight );
      this.listenTo( this.model, 'error', this.renderError );
      this.listenTo( this.model, 'sorted', this.renderSvg );

      if ( this.generateChartName ) {
        this.generateChartName();
      }
    },


    addJobChart : function() {
      require(
        [ 'jobModel', 'config' ],
        _.bind(function( ChartModel, Config ) {
          var type        = 'jobChart',
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


    clearSort : function() {
      console.log( 'clearSort' );
      this.model.clear();
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


    renderError : function( model, response ) {
      this.$el.find( '.loadingContainer' ).remove();

      console.log( 'Render error' );
      var html = '<div class="errorMessage">' +
                    this.model.get( 'error' ).message + '<hr>';

      if ( response.status === 503 || response.status === 500 ) {
        html += 'Sorry connection to Github API is not workin\' correctly...';
      } else if ( response.status === 404 ) {
        html += 'Sorry. Github doesn\'t know a repo ' +
                   model.get( 'repoOwner' ) + ' / ' + model.get( 'repoName' ) + '.';
      } else if ( response.status === 403 ) {
        html += 'Sorry. Github doesn\'t allow more request at the moment. ' +
                   'Please try again later.';
      }

      html += '</div>';

      if ( this.$errorContainer ) {
        this.$errorContainer.html( html );
      } else {
        this.$el.append(
          '<div class="errorContainer>' + html + '</div>'
        );
      }
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
      var data          = this.model.get( 'displayedData' ) ||
                          this.model.get( 'data' ),

          margin   = { top: 40, right: 10, bottom: 50, left: 10, nodeTop: 30 },
          elWidth  = this.$el.width(),
          elHeight = this.$el.height(),

          node = {
            build : {
              width  : 50
            },
            file : {
              width : 350
            }
          },

          reset = {
            height : 30,
            width  : 200
          },

          d3el = d3.select( this.el ),

          nodes       = data.nodes,
          buildNodes = nodes.filter( function( node ) {
            return node.type === 'build';
          } ),
          fileNodes   = nodes.filter( function( node ) {
            return node.type === 'file';
          } ),

          resizeForBuilds = (( elHeight / buildNodes.length ) < 20 ),
          resizeForFiles   = (( elHeight / fileNodes.length ) < 20 ),

          view = this,

          nodesGroup,
          nodeGroup,
          linksGroup,
          linkGroup,

          links,

          width,
          height,
          y;

      // store it for later
      this.d3el = d3el;

      // check it will fit, if not resize window at beginning
      if ( !this.optimizedView && ( resizeForBuilds || resizeForFiles ) ) {
        this.optimizedView = true;

        //it will be files let's ignore builds quickly
        this.$el.height( fileNodes.length * 20 );

      }

      // this stuff needs to happen after check for resizing
      elWidth  = this.$el.width();
      elHeight = this.$el.height();
      width    = elWidth - margin.left - margin.right;
      height   = elHeight - margin.top - margin.bottom;

      y = {
        build : d3.scale.ordinal()
                    .rangeRoundBands( [ 0, ( height - margin.nodeTop ) ], 0.1 ),
        file  : d3.scale.ordinal()
                    .rangeRoundBands( [ 0, ( height - margin.nodeTop ) ], 0.1 )
      };

      function calculateNodePositions( nodes ) {
        var index = {
          build : 0,
          file  : 0
        };

        y.build.domain(
          buildNodes.map(
            function( d ) {
              return d.name;
            }
          )
        );

        y.file.domain(
          fileNodes.map(
            function( d ) {
              return d.name;
            }
          )
        );

        node.build.height = y.build.rangeBand();
        node.file.height  = y.file.rangeBand();

        nodes.forEach( function( value ) {
          value.x = ( value.type === 'build') ? 0 : ( width - node[ value.type ].width ),
          value.y = y[ value.type ]( value.name ) + margin.nodeTop;

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
              sourceOffsetX = node[ sourceNode.type ].width,
              sourceOffsetY = node[ sourceNode.type ].height / 2,

              targetOffsetY = node[ targetNode.type ].height / 2,

              sourceX = sourceNode.x + sourceOffsetX,
              sourceY = sourceNode.y + sourceOffsetY,

              targetX = targetNode.x,
              targetY = targetNode.y + targetOffsetY;

          link.path = 'M' + sourceX + ' ' + sourceY +
                      ' C ' + (sourceX + width / 2) + ' ' + sourceY + ', ' +
                      (targetX - width / 2 ) + ' ' + targetY + ', ' +
                      targetX + ' ' + targetY;
        } );

        return links;
      }


      nodes = calculateNodePositions( nodes ),
      links = calculateNodePaths( data.links, nodes );

      d3el.select( 'svg' ).remove();

      this.svg = d3el.append( 'svg' )
              .attr( 'width', width )
              .attr( 'height', height + margin.top );


      if ( this.model.get( 'displayedData' ) ) {
        var resetButton = this.svg.append( 'g' )
                              .attr( 'class', 'resetButton' )
                              .attr(
                                'transform',
                                'translate( ' + ( width - reset.width ) + ', ' + margin.top + ' )'
                              )
                              .attr( 'data-action-click', 'clearSort' );

        resetButton.append( 'rect' )
                    .attr( 'width', reset.width )
                    .attr( 'height', reset.height )
                    .attr( 'data-action-click', 'clearSort' );

        resetButton.append( 'text' )
                    .text( 'Reset and show all Builds!' )
                    .attr( 'y', reset.height / 2 + 6 )
                    .attr( 'x', 5 )
                    .attr( 'data-action-click', 'clearSort' );

      }

      linksGroup = this.svg.append( 'g' )
                            .attr( 'class', 'links' )
                            .attr( 'transform', 'translate( 0, 40 )');

      linkGroup = linksGroup.selectAll( 'link' )
                            .data( links )
                            .enter().append( 'path' )
                            .attr( 'class', 'link' )
                            .attr( 'd', function( d ) {
                              return d.path;
                            } )
                            .attr( 'stroke', 'black' )
                            .attr( 'stroke-width', function( d ) {
                              return d.commits || 1;
                            } )
                            .attr('fill', 'transparent')
                            .attr( 'data-source', function( d ) {
                              return d.source;
                            } )
                            .attr( 'data-target', function( d ) {
                              return d.target;
                            } );

      nodesGroup = this.svg.append( 'g' )
                            .attr( 'class', 'nodes' )
                            .attr( 'transform', 'translate( 0, 40 )');

      nodeGroup = nodesGroup.selectAll( '.node' )
                    .data( nodes )
                    .enter().append( 'g' )
                    .attr( 'class', function( d ) {
                      var classes = 'node';

                      if ( d.type === 'build' && d.status === 0) {
                        classes += ' failed';
                      }

                      return classes;
                    } )
                    .attr( 'data-name', function( d ) {
                      return d.name;
                    } )
                    .attr(
                      'transform',
                      function( d ) {
                        return 'translate(' + d.x + ',' + d.y + ')';
                      }
                    )
                    .on( 'mouseover', function( d ) {
                      var sourceSelector = ( d.type === 'build' ) ? 'source' : 'target',
                          targetSelector = ( d.type === 'build' ) ? 'target' : 'source',
                          paths          = d3el.selectAll(
                                            'path[data-' + sourceSelector + '="' + d.name + '"]'
                                          );

                      nodeGroup.classed( 'unHighlighted', true );

                      if ( paths.length ) {
                        paths.classed( 'highlighted', true );

                        d3el.selectAll( '.link' ).sort( function( link ) {
                          if ( link[ sourceSelector ] === d.name ) {

                            return 1;
                          } else {
                            return -1;
                          }
                        } );

                        paths.each( function( path ) {
                          d3el.selectAll(
                            '.node[data-name="' + path[ targetSelector ] + '"]'
                          ).classed( 'unHighlighted', false );
                        } );

                        var d3Node = d3.select( this ).classed( 'unHighlighted', false );

                        if (
                          d.type === 'build' &&
                          !d3Node.selectAll( '.dialog' )[ 0 ].length
                        ) {
                          view.showSortDialog( d3Node, d, node );
                        }
                      }
                    } )
                    .on( 'mouseleave', function( d ) {
                      var selector = ( d.type === 'build' ) ? 'source' : 'target',
                          paths = d3.selectAll(
                                    'path[data-' + selector + '="' + d.name + '"]'
                                  );

                      if ( paths.length ) {
                        paths.classed( 'highlighted', false );
                        nodeGroup.classed( 'unHighlighted', false );
                      }

                      if ( d.type === 'build' ) {
                        d3el.selectAll( '.dialog' ).remove();
                      }
                    } );

      nodeGroup.each( function( currentNode, index ) {
        var d3Node = d3.select( this );

        if ( currentNode.type === 'build' ) {
          d3Node.append( 'rect' )
                .attr( 'height', function() {
                  return node[ currentNode.type ].height;
                } )
                .attr( 'width', function() {
                  return node[ 'build' ].width;
                } );
        } else {
          d3Node.append( 'rect' )
                .attr( 'class', 'passed' )
                .attr( 'height', function( d ) {
                  return node[ d.type ].height;
                } )
                .attr( 'width', function( d ) {
                  if ( d.type === 'file' ) {
                    var passed = d.passed || 0,
                        failed = d.failed || 0,
                        width = node[ 'file' ].width / ( passed + failed ) * passed;

                    return width;
                  } else {
                    return node[ 'build' ].width;
                  }
                } )
                .attr( 'data-passed', function( d ) {
                  return d.passed || 0;
                } );

          d3Node.append( 'rect' )
                .attr( 'class', 'failed' )
                .attr( 'height', function( d ) {
                  return node[ d.type ].height;
                } )
                .attr( 'width', function( d ) {
                  if ( d.type  === 'file' ) {
                    var passed = d.passed || 0,
                        failed = d.failed || 0,
                        width = node[ 'file' ].width / ( passed + failed ) * failed;

                    return width;
                  } else {
                    return node[ 'build' ].width;
                  }
                } )
                .attr( 'x', function( d ) {
                  if ( d.type === 'file' ) {
                    var passed = d.passed || 0,
                        failed = d.failed || 0,
                        x = node[ 'file' ].width / ( passed + failed ) * passed;

                    return x;
                  } else {
                    return 0;
                  }
                } )
                .attr( 'data-failed', function( d ) {
                  return d.failed || 0;
                } );
        }

        d3Node.append('text')
              .attr( 'x', '5' )
              .attr( 'y', function( d ) {
                // 12px font-size atm -> centering it y wise
                return node[ d.type ].height / 2 + 6;
              } )
              .text(
                function( d ) {
                  return d.name;
                }
              );
      } );

    },


    showSortDialog : function( d3Node, currentNode, nodeConfig ) {
      if ( !this.model.get( 'displayedData' ) ) {
        var dialog = d3Node.append( 'g' )
                            .attr( 'class', 'dialog' )
                            .attr( 'data-action-click', 'sortItems' )
                            .attr( 'data-type', currentNode.status ),
            status = currentNode.status ? 'passed' : 'failed';

        dialog.append( 'rect' )
                .attr( 'width', 190 )
                .attr( 'height', nodeConfig[ currentNode.type ].height )
                .attr( 'x', nodeConfig[ currentNode.type ].width )
                .attr( 'data-action-click', 'sortItems' )
                .attr( 'data-type', currentNode.status );

        dialog.append( 'text' )
                .text( 'Show only ' + status + ' builds!' )
                .attr( 'x', nodeConfig[ currentNode.type ].width )
                .attr( 'y', nodeConfig[ currentNode.type ].height / 2 + 6 )
                .attr( 'data-action-click', 'sortItems' )
                .attr( 'data-type', currentNode.status );
      }
    },


    sortItems : function( event, target ) {
      this.model.sort( target.dataset.type );
    },


    toggleAttributes : function( event ) {
      $( event.target ).toggleClass( 'clicked' );

      var $attributes = this.$attributes || this.$el.find( '.attributes' );
      var $attributesContainer  = this.$attributesContainer || this.$el.find( '.attributesContainer' );

      $attributesContainer.toggleClass( 'shown' );
      $attributes.toggleClass( 'shown' );

    }
  });


  return RepoSVGView;
});
