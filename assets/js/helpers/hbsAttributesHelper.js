define([
  'handlebars',
  'config'
], function( Handlebars, Config ) {
  Handlebars.registerHelper('attributes', function() {
    var html            = '<dl>',
        i               = 0,
        repo            = this.repo,
        repoInformation = Config.shownGithubRepoInformation;

    repoInformation.forEach( function( element ) {
      html += '<dt>' + element;
      // write simple properties
      if ( !element.match(/\./) ) {
        html += '<dd>' +
                  ( ( repo[ element ] === '' )
                    ? '( empty )'
                    : repo[ element ] );
      } else {
        // combine properties to one definition list entry
        html += '<dd>';

        var properties = element.split( '.' );

        if ( repo[ properties[ 0 ] ] ) {
          // TODO make this generic
          html += repo[ properties[ 0 ] ][ properties[ 1 ] ] + ' ';
        }
      }
    } );

    html += '</dl>';

    return new Handlebars.SafeString( html );
  });
});

