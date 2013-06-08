define([
  'handlebars'
], function( Handlebars) {
  Handlebars.registerHelper('attributes', function() {
    var html = '<dl>',
        i = 0,
        repo = this.repo;

    for (var property in repo) {
      html += '<dt>' + property +
              '<dd>' + repo[ property ];
    }

    html += '</dl>';

    return new Handlebars.SafeString( html );
  });
});

