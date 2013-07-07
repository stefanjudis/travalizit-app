define([], function() {
  return {
    charts : [
      {
        icon        : 'bar-chart',
        description : 'Get a nice success/fail overview of all builds stored ' +
                      'inside of the Travalizit database. This will be ' +
                      'presented in a kind of bar chart',
        name        : 'Success/Fail for time unit',
        params      : [
          {
            defaultValue : (function() {
              var date = new Date(),
                  day,
                  dayString,
                  month,
                  monthString;

              date.setDate(date.getDate() - 14);

              day = date.getDate();
              dayString = ( day < 10) ? '0' + day : day;

              month = date.getMonth() + 1;
              monthString = ( month < 10) ? '0' + month : month;

              return date.getUTCFullYear() + '-' + monthString + '-' + dayString;
            })(),
            label        : 'Date to start:',
            name         : 'startDate',
            type         : 'date'
          }, {
            defaultValue : (function() {
              var date = new Date(),
                  day,
                  dayString,
                  month,
                  monthString;

              day = date.getDate();
              dayString = ( day < 10) ? '0' + day : day;

              month = date.getMonth() + 1;
              monthString = ( month < 10) ? '0' + month : month;

              return date.getUTCFullYear() + '-' + monthString + '-' + dayString;
            })(),
            label        : 'Date to end:',
            name         : 'endDate',
            type         : 'date'
          }, {
            defaultValue : 'unitDay',
            label        : 'Bars seperated in:',
            name         : 'unit',
            type         : 'radio',

            values       : [
              {
                id    : 'unitDay',
                value : 'days',
                label : 'days'
              },
              {
                id    : 'unitWeek',
                value : 'weeks',
                label : 'weeks'
              }
            ]
          }
        ],
        type : 'barChart',
        url  : 'builds'
      },
      {
        icon        : 'circle',
        description : 'Get a nice of overview which project was triggered the' +
                      'most on a given day / week',
        name        : 'Detail view for time unit',
        params      : [
          {
            defaultValue : (function() {
              var date = new Date(),
                  day,
                  dayString,
                  month,
                  monthString;

              day = date.getDate();
              dayString = ( day < 10) ? '0' + day : day;

              month = date.getMonth() + 1;
              monthString = ( month < 10) ? '0' + month : month;

              return date.getUTCFullYear() + '-' + monthString + '-' + dayString;
            })(),
            label        : 'Date',
            name         : 'date',
            type         : 'date'
          }, {
            defaultValue : '9',
            label        : 'Week:',
            name         : 'week',
            type         : 'number'
          }, {
            defaultValue : 'unitDay',
            label        : 'Bars seperated in:',
            name         : 'unit',
            type         : 'radio',

            values       : [
              {
                id    : 'unitDay',
                value : 'day',
                label : 'day'
              },
              {
                id    : 'unitWeek',
                value : 'week',
                label : 'week'
              }
            ]
          }
        ],
        type   : 'circleChart',
        url    : 'builds'
      },
      {
        icon        : 'github',
        description : 'Get a nice overview of which files were included in' +
                      ' which builds.',
        name        : 'Github details',
        params      : [
          {
            defaultValue : 'stefanjudis',
            label        : 'Owner:',
            name         : 'repoOwner',
            type         : 'text'
          }, {
            defaultValue : 'cushion-cli',
            label        : 'Name:',
            name         : 'repoName',
            type         : 'text'
          }
        ],
        type   : 'repoChart',
        url    : 'repos'
      },
      {
        icon        : 'bar-chart',
        description : 'Get a nice overview of the last builds of a ' +
                      'particular project showing the jobs it consited of ' +
                      'and how these performed in comparison.',
        name        : 'Travis job details',
        params      : [
          {
            defaultValue : 'stefanjudis',
            label        : 'Owner:',
            name         : 'repoOwner',
            type         : 'text'
          }, {
            defaultValue : 'cushion-cli',
            label        : 'Name:',
            name         : 'repoName',
            type         : 'text'
          }
        ],
        type   : 'jobChart',
        url    : 'jobs'
      }
    ],

    shownGithubRepoInformation : [
      'id',
      'name',
      'description',
      'homepage',
      'language',
      'owner.login',
      'owner.id',
      'owner.type',
      'fork',
      'forks',
      'private',
      'size',
      'open_issues',
      'watchers'
    ],

    svgChartView : {
      height : 600,
      width  : 800
    }
  };
});
