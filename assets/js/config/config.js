define([], function() {
  return {
    charts : [
      {
        icon     : 'bar-chart',
        name     : 'Success/Fail per time unit',
        params   : [
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
        type   : 'barChart',
        url    : 'builds'
      },
      {
        icon     : 'circle',
        name     : 'Details per time unit',
        params   : [
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
        icon     : 'github',
        name     : 'Repository details',
        params   : [
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
      height : 500,
      width  : 800
    }
  };
});
