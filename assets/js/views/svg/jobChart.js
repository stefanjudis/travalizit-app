define([
  'underscore',
  'd3',
  'generalSVGView'

], function( _, d3, GeneralSVGView ) {
  var JobSVGView = GeneralSVGView.extend({
    renderSvg : function() {
      var margin = { top: 20, right: 20, bottom: 130, left: 80 },
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

      x.domain( builds.map( function( d ) { return Object.keys( d )[ 0 ]; } ) );
      y.domain( [ 0, data.maxDuration ] );

      this.svg.append( 'g' )
          .attr( 'class', 'x axis' )
          .attr( 'transform', 'translate(0,' + height + ')' )
          .call( xAxis )
          .selectAll( 'text' )
          .attr( 'dx', '-3em' )
          .attr( 'dy', '0.5em' )
          .attr( 'transform', function( d ) {
            return 'rotate(-45)';
          } );

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
            jobs     = build[ buildId ].jobs;

        currentX.domain(
          jobs.map( function( d ) { return d.id; } ) );

        var svgBars = this.svgBarsContainer.append( 'g' )
                          .attr( 'class', 'bars-' + buildId )
                          .attr(
                            'transform', 'translate( ' + x( buildId ) + ', 0 )'
                          )
                          .selectAll( '.bar-' + buildId )
                          .data( jobs )
                          .enter()
                          .append( 'rect' )
                          .attr( 'x', function( d ) {
                            return currentX( d.id );
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
                            return 'bar-job-' + d.id + ' bar ' + d.state;
                          } )
                          .attr( 'data-duration', function( d ) {
                            return d.duration;
                          } );


      }, this ) );
    }


  });


  return JobSVGView;
});
