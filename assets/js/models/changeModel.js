define([
  'chartModel'
], function( ChartModel ) {

  var ChangeModel = ChartModel.extend({
    getGroupedChanges : function( dividerNumber ) {
      var data           = this.get( 'data' ),
          builds         = data.builds,
          groupedChanges = [];

      dividerNumber = dividerNumber || 100;

      builds.forEach( function( build ) {
        var changeObject = {},
            currentChange = _.find( groupedChanges, function( change ) {
          return change.changes === build.changes;
        } )

        if ( !currentChange ) {
          currentChange = {
            changes : build.changes,
            passed  : 0,
            failed  : 0
          };

          groupedChanges.push( currentChange );
        }


        if ( build.status ) {
          currentChange.passed++;
        } else {
          currentChange.failed++;
        }

      } );

      groupedChanges = _.groupBy(
        _.map( groupedChanges, _.bind( function( change ) {
          var lineChanges = change.changes,
              factor      = Math.floor( lineChanges / dividerNumber ) + 1,
              newChanges  = dividerNumber * factor;

          change.changesGroup = newChanges;

          return change;
        }, this ) ),
        function( change ) {
          return change.changesGroup;
        }
      );

      _.each( groupedChanges, function( change, key ) {
        groupedChanges[ key ] = _.reduce( change, function( memo, partialChange ) {
          return {
            group  : key,
            passed : memo.passed + partialChange.passed,
            failed : memo.failed + partialChange.failed
          }
        } );
      } );

      return groupedChanges;
    }
  });

  return ChangeModel;
});
