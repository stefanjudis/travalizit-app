define([], function() {
  return {
    charts : [
      {
        icon   : 'dashboard',
        name   : 'Success/Fail per time unit',
        params : [
          {
            defaultValue : '2012-04-27',
            label        : 'Date to start:',
            name         : 'startDate',
            type         : 'date'
          }, {
            defaultValue : '2012-05-05',
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
        type : 'barChartSuccessFail',
        url  : 'builds'
      }
      // {
      //   icon   : 'wrench',
      //   name   : 'builds',
      //   params : [
      //     'number',
      //     'status',
      //     'started_at',
      //     'finished_at',
      //     'repository_id',
      //     'agent',
      //     'create_at',
      //     'updated_at',
      //     'config',
      //     'commit_id',
      //     'request_id',
      //     'state',
      //     'language',
      //     'archived_at',
      //     'duration',
      //     'owner_id',
      //     'owner_type',
      //     'result',
      //     'previous_result',
      //     'event_type'
      //   ],
      //   srcPath : '/builds'
      // }, {
      //   icon : 'bookmark-empty',
      //   name : 'commits'

      // }, {
      //   icon : 'th-large',
      //   name : 'dimensions'
      // }, {
      //   icon : 'suitcase',
      //   name : 'jobs'
      // }, {
      //   icon : 'group',
      //   name : 'memberships'
      // }, {
      //   icon : 'building',
      //   name : 'organizations'
      // }, {
      //   icon : 'hdd',
      //   name : 'repositories'
      // }, {
      //   icon : 'phone-sign',
      //   name : 'requests'
      // }, {
      //   icon : 'signout',
      //   name : 'urls'
      // }
    ]
  };
});
