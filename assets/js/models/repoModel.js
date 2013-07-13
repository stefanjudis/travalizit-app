define([
  'chartModel'
], function( ChartModel ) {

  var RepoModel = ChartModel.extend({
    clear : function() {
      this.set( 'displayedData', false );
      this.trigger( 'sorted' );
    },


    search : function( regex ) {
      var data   = this.get( 'displayedData' ) || this.get( 'data' ),
          newLinks      = [],
          newNodes;

      newNodes = _.filter(
        data.nodes,
        function( node ) {
          return node.name.search( regex ) !== -1;
        }
      );

      newNodes.forEach( function( node ) {
        data.links.forEach( function( link ) {
          if ( link.target === node.name ) {
            newLinks.push( link );

            var currentTarget = _.find(
              newNodes,
              function( targetNode ) {
                return targetNode.name === link.source;
              }
            );

            if ( !currentTarget ) {
              var newTargetNode = _.find(
                data.nodes,
                function( node ) {
                  return node.name === link.source;
                }
              );

              newNodes.push( newTargetNode );
            }
          }
        } );
      } );

      displayedData = {
        nodes : newNodes,
        links : newLinks
      };

      console.log( displayedData );
      this.set( 'displayedData', displayedData );
      this.trigger( 'sorted' );
    },


    sort : function( status ) {
      var data          = this.get( 'data' ),
          newLinks      = [],
          displayedData,
          newNodes;

      newNodes = _.filter(
        data.nodes,
        function( node ) {
          return node.status === +status;
        }
      );

      newNodes.forEach( function( node ) {
        data.links.forEach( function( link ) {
          if ( link.source === node.name ) {
            newLinks.push( link );

            var currentTarget = _.find(
              newNodes,
              function( targetNode ) {
                return targetNode.name === link.target;
              }
            );

            if ( !currentTarget ) {
              var newTargetNode = _.find(
                data.nodes,
                function( node ) {
                  return node.name === link.target;
                }
              );

              newNodes.push( newTargetNode );
            }
          }
        } );
      } );

      displayedData = {
        nodes : newNodes,
        links : newLinks
      };

      console.log( displayedData );
      this.set( 'displayedData', displayedData );
      this.trigger( 'sorted' );
    }
  });

  return RepoModel;
});
