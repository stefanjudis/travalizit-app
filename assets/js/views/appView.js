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

      this.listenTo( charts, 'add', this.addChart );
      this.listenTo( charts, 'add', this.hideMenues );
    },


    addChart : function( chart ) {
      require( [ 'chartView' ], function( ChartView ) {
        var view = new ChartView( chart );
        var html = view.render();

        this.$( '#chartsContainer' ).append( html );
      });
    },


    createChart : function( event ) {
      event.preventDefault();

      require(
        [ 'chartModel' ],
        function( ChartModel ) {
          var form  = $( event.target ),
              type  = form.find( '#paramInput-type' ).val(),
              data  = form.serializeArray(),
              chart = new ChartModel(
                            data,
                            {
                              parse : true,
                              url   : type
                            }
                          );

          charts.push( chart );
        }
      );
    },


    hideMenues : function() {
      // TODO cache that stuff
      $( '.animationContainer' )
        .removeClass( 'shown' );
    },

    showChartMenu : function() {
      require(
        [ 'handlebars', 'text!chartSelectTemplate' ],
        _.bind(function( Handlebars, ChartSelectTemplate ) {
          var template,
              html;

          if ( this.$chartMenu.html() === '' ) {
            template = Handlebars.compile( ChartSelectTemplate );
            html     = template({
                chartTypes : _.keys( Config.charts )
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
                chartParams : Config.charts[ type ].params
              });

              if ( params.length && params.hasClass( 'shown' ) ) {
                params.removeClass( 'shown' );

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