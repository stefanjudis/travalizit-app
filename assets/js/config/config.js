define([], function() {
  return {
    charts : [
      {
        icon   : 'dashboard',
        name   : 'Builds per Time',
        params : [
          {
            name : 'startDate',
            type : 'date'
          }, {
            name : 'endDate',
            type : 'date'
          }
        ]
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
