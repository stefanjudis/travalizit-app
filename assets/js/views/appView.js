define([
  'jquery',
  'underscore',
  'backbone',
  'config',
  'chartCollection'
], function( $, _, Backbone, Config, Charts ) {
  var AppView = Backbone.View.extend({
    el  : '#sidebar',
    // don't want to have jshint error
    // for not defined $el variable. ;)
    $el        : $( this.el ),
    $chartMenu : undefined,


    events : {
      'click #addBtn'   : 'showChartMenu',
      'click .addChart' : 'showParamMenu',
      'click #sizeBtn'  : 'toggleViewSize',

      'submit #chartParamsForm' : 'createChart'
    },


    initialize : function() {
      charts = new Charts();

      this.$chartMenu = this.$el.find( '#chartSelectMenu' );

      this.listenTo( charts, 'add', this.addCharts );
      this.listenTo( charts, 'add', this.hideMenues );
    },


    addCharts : function( chart ) {
      require(
        [ 'chartView', 'chartSVGView' ],
        function( ChartView, ChartSVGView) {
          var chartView    = new ChartView( chart ),
              chartHtml    = chartView.render(),
              SVGView      = new ChartSVGView( chart ),
              svgHtml      = SVGView.render();


          this.$( '#chartsContainer' ).append( chartHtml );

          // TODO change this
          // shouldn't query the whole dom
          $( '#chartsCanvas' ).append( svgHtml );
        }
      );
    },


    createChart : function( event ) {
      event.preventDefault();

      require(
        [ 'chartModel' ],
        _.bind(function( ChartModel ) {
          var form        = $( event.target ),
              type        = form.find( '#paramInput-type' ).val(),
              chartConfig = _.find( Config.charts, function( chart ) {
                              return chart.name === type;
                            }),
              data        = form.serializeArray(),
              chart;

          data.push({
            name  : 'config',
            value : {
              icon: chartConfig.icon
            }
          });

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


    hideMenues : function() {
      $( '.animationContainer' ).removeClass( 'shown' );

      // that's super dirty... :()
      setTimeout( _.bind(function() {
        this.$chartMenu.hide();
      }, this) , 500 );
    },

    showChartMenu : function() {
      require(
        [ 'handlebars', 'text!chartSelectTemplate' ],
        _.bind(function( Handlebars, ChartSelectTemplate ) {
          var template,
              html;

          this.$chartMenu.show();

          if ( this.$chartMenu.html() === '' ) {
            template = Handlebars.compile( ChartSelectTemplate );
            html     = template({
                charts     : Config.charts
              });

            this.$chartMenu.html( html );
          }

          this.$chartMenu.find( '#chartTypes' )
            .addClass( 'shown' );
        }, this )
      );
    },


    showParamMenu : function( event ) {
      require(
        [ 'handlebars', 'text!chartParamsTemplate'],
        _.bind(function( Handlebars, ChartParamsTemplate ) {
          var button   = $( event.target ),
              type     = button.data( 'type' ),
              params   = this.$chartMenu.find( '#chartParams' ),
              template = Handlebars.compile( ChartParamsTemplate ),
              html     = template({
                chartParams : _.find(
                                Config.charts,
                                function( chart ) {
                                  return chart.name === type;
                                }
                              ).params
              });

              this.$chartMenu.show();

              if ( params.length && params.hasClass( 'shown' ) ) {
                params.removeClass( 'shown' );

                // hmm should we unbind that somehow
                // do we run into any trouble????
                params.on(
                  'animationend webkitAnimationEnd otransitionend',
                  _.bind(function() {
                    params.remove();

                    this._addParamsContainer( html, type );
                  }, this)
                );
              } else {
                params.remove();

                this._addParamsContainer( html, type );
              }
        }, this )
      );
    },


    toggleViewSize : function() {
      this.$el.toggleClass( 'minimized' );
    },


    _addParamsContainer : function( html, type ) {
      this.$chartMenu
          .append( html );

      this.$chartMenu
          .find( '#chartParams' )
          .addClass( 'shown' );
      this.$chartMenu
          .find( '#paramInput-type' )
          .val( type );
    }
  });


  return AppView;
});
