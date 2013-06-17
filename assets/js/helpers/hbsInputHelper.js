define([
  'handlebars'
], function( Handlebars) {
  Handlebars.registerHelper('input', function() {
    var inputHtml = '',
        i = 0,
        first = true;

    if ( this.type === 'radio' ) {
      inputHtml += '<label for="paramInput-' + this.defaultValue + '">' +
                      this.label +
                    '</label>' +
                    '<ul class="radioButtonList">';

      for ( i; i < this.values.length; i++ ) {
        inputHtml += '<li>' +
                        '<label for="paramInput-' + this.values[ i ].id + '">' +
                            this.values[ i ].label +
                        '</label>' +
                        '<input id="paramInput-' + this.values[ i ].id + '" ' +
                          'name="paramInput-' + this.name + '" ' +
                          'type="' + this.type + '" ' +
                          'value="' + this.values[ i ].value + '"';

        if ( first ) {
          inputHtml += ' checked="checked"';
          first = false;
        }

        inputHtml += '>' +
                      '</li>';
      }

      inputHtml += '</ul>';

    } else {
      inputHtml = '<input id="paramInput-' + this.name + '" ' +
                        'name="paramInput-' + this.name + '" ' +
                        'type="' + this.type + '" ' +
                        'value="' + this.defaultValue + '"' +
                  '>' +
                  '<label for="paramInput-' + this.name + '">' + this.label + '</label>';
    }

    return new Handlebars.SafeString( inputHtml );
  });
});

