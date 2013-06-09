define([], function() {
  return {
    charts : [
      {
        icon   : 'bar-chart',
        name   : 'Success/Fail per time unit',
        params : [
          {
            defaultValue : '2013-05-15',
            label        : 'Date to start:',
            name         : 'startDate',
            type         : 'date'
          }, {
            defaultValue : '2013-06-08',
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
        icon   : 'align-justify',
        name   : 'Details per time unit',
        params : [
          {
            defaultValue : '2013-06-07',
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
        type : 'circleChart',
        url  : 'builds'
      },
      {
        icon   : 'github',
        name   : 'Repository details',
        params : [
          {
            defaultValue : 'stefanjudis',
            label        : 'Owner:',
            name         : 'repoOwner',
            type         : 'text'
          }, {
            defaultValue : 'travalizit',
            label        : 'Name:',
            name         : 'repoName',
            type         : 'text'
          }
        ],
        type : 'repoChart',
        url  : 'repos'
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
      height : 350,
      width  : 700
    }
  };
});
