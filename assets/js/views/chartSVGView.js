define([
  'underscore',
  'backbone',
  'handlebars',
  'd3',
  'text!chartSvgItem'

], function( _, Backbone, Handlebars, d3, ChartSvgItem ) {

  var ChartSVGView = Backbone.View.extend({
    className : 'svgChartItem',

    template : Handlebars.compile( ChartSvgItem ),

    events : {
      'click button' : 'deleteChart'
    },


    initialize : function( chart ) {
      this.model = chart;

      this.listenTo( this.model, 'destroy', this.remove );
      this.listenTo( this.model, 'sync', this.render );
    },


    render : function() {
      var html = this.$el.html(
                this.template()
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

          svg = d3.select( this.el ).append( 'svg' )
                  .attr( 'width', width + margin.left + margin.right )
                  .attr( 'height', height +  margin.top + margin.bottom )
                  .append( 'g' )
                  .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' ),

          data = this.model.get( 'data' );

      console.log( data );

      x.domain( data.map( function( d ) { return d.day.substring( 0, 10 ); } ) );
      y.domain( [ 0, d3.max( data, function( d ) { return d.count; } ) ] );

      svg.append( 'g' )
          .attr( 'class', 'x axis' )
          .attr( 'transform', 'translate(0,' + height + ')' )
          .call( xAxis );

      svg.append( 'g' )
          .attr( 'class', 'y axis' )
          .call( yAxis )
          .append( 'text' )
          .attr( 'transform', 'rotate(-90)' )
          .attr( 'y', 6 )
          .attr( 'dy', '-4em' )
          .style( 'text-anchor', 'end' )
          .text( 'Builds' );

      svg.selectAll( '.bar' )
          .data( data )
          .enter().append( 'rect' )
          .attr( 'class', 'bar' )
          .attr( 'x', function( d ) { return x( d.day ); } )
          .attr( 'width', x.rangeBand() )
          .attr( 'y', function( d ) { return y( d.count ); } )
          .attr( 'height', function( d ) { return height - y( d.count ); } );
    },


    deleteChart : function() {
      this.model.destroy();
    },


    remove : function() {
      this.$el.addClass( 'removed' )
              .on(
                'animationend webkitAnimationEnd otransitionend',
                _.bind( function() {
                  this.$el.remove();
                }, this )
              );
    }

  });

  return ChartSVGView;
});
