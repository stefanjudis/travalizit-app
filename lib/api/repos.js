/*
 * Travalizit
 * https://github.com/stefanjudis/travalizit
 *
 * Copyright (c) 2013 stefan judis
 * Licensed under the MIT license.
 */

var events         = require( 'events' ),
    eventEmitter   = new events.EventEmitter(),
    repos          = module.exports = {},
    Github         = require( 'github' ),
    github         = new Github( { version : '3.0.0', timeout : 2000, debug : true } ),
    pg             = require( 'pg' ),
    conString      = process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_VIOLET_URL,
    client,
    countBuildFetch,
    responseObject;

github.authenticate({
    type     : 'basic',
    username : 'stefanjudis',
    password : 'Htw2mdVahL&'
});

repos.get = function( req, res ) {
  countBuildFetch = 0;
  responseObject = {
    nodes : [],
    links : []
  };

  // trigger response sending
  eventEmitter
    .removeAllListeners()
    .on( 'allFilesFetched', repos._sendResponse );

  var queryParams    = req.query,
      repoOwner      = queryParams.repoOwner,
      repoName       = queryParams.repoName,
      message        = {
        user : repoOwner,
        repo : repoName
      };

  github.repos.get(
    message,
    repos._githubReposGetHandler.bind( {
      repoName  : repoName,
      repoOwner : repoOwner,
      res       : res
    } )
  );
};


repos._getBuildFiles = function( responseObject, callback ) {
  var builds = responseObject.builds;

  builds.forEach(function( value, index, builds) {
    var message = {
      user : responseObject.github.owner.login,
      repo : responseObject.github.name,
      sha  : value.commit
    };

    if ( index > 0 ) {
      builds[index - 1].parent_build = value.commit;
    }

    console.log( '\n**************** GETBUILDFILES ****************\n' );
    console.log( 'SHA: ' +  value.commit );
    github.repos.getCommit(
      message,
      function( error, result ) {
        callback( error, result, value.commit, value.parent_build );
      }.bind( this )
    );
  });
};


repos._getBuildFilesHandler = function( error, result, currentBuildSha, parentBuildSha, iteration ) {
  console.log( '\n\n**************** GETBUILDFILESHANDLER ****************\n' );
  var currentBuild,
      currentBuildIndex;

  iteration = iteration || 0;

  // just logging the whole async stuff gots crazy
  console.log( 'CurrentBuildSHA: ' + currentBuildSha );
  console.log( 'ParentBuildSHA: ' + parentBuildSha );

  if ( error ) {
    console.log( 'ERROR in repos._getBuildFilesHandler' );
    console.log( error );
    ++countBuildFetch;
    eventEmitter.emit(
      'allFilesFetched',
      responseObject,
      this.res,
      client
    );
  } else {
    console.log( 'ResultSHA: ' +  result.sha );

    // TODO that can be done smarter, can it???
    currentBuild = responseObject.builds.filter( function( build ) {
      return build.commit === currentBuildSha;
    } )[ 0 ];

    currentBuildIndex = responseObject.builds.indexOf( currentBuild );

    result.files.forEach( function( value ) {
      responseObject.nodes.push( {
        name : value.filename,
        type : 'file'
      } );

      responseObject.links.push( {
        source : currentBuild.number,
        target : value.filename
      } );
    } );

    if( parentBuildSha ) {
      if ( result.parents.length ) {
        result.parents.forEach( function( parent ) {
          if ( parent.sha === parentBuildSha ) {
            ++countBuildFetch;
            console.log('ALL FILES FETCHED');
            eventEmitter.emit(
              'allFilesFetched',
              responseObject,
              this.res,
              client
            );

            return;
          } else {
            var message = {
              user : responseObject.github.owner.login,
              repo : responseObject.github.name,
              sha  : parent.sha
            };


            ++iteration;

            if ( iteration < 15 ) {
              console.log(
                '\n**** GET COMMIT: ' + parent.sha + ' ' +
                'ITERATION: ' + iteration + '****'
              );
              github.repos.getCommit(
                message,
                function( error, result ) {
                  repos._getBuildFilesHandler.apply(
                    this,
                    [
                      error,
                      result,
                      currentBuildSha,
                      parentBuildSha,
                      iteration
                    ]
                  );
                }.bind( this )
              );
            } else {
              console.log('TOO MANY ITERATIONS SENDING ALL FILES FETCHED');
              ++countBuildFetch;

              eventEmitter.emit(
                'allFilesFetched',
                responseObject,
                this.res,
                client
              );
            }
          }
        }.bind( this ) );
      }
    } else {
      console.log('ALL FILES FETCHED');
      eventEmitter.emit(
        'allFilesFetched',
        responseObject,
        this.res,
        client
      );
    }
  }
};


// TODO absolute callback hellllllllllll - fix it....
repos._githubReposGetHandler = function( error, repo ) {
  var queryString;

  if ( error ) {
    repos._handleError(
      error,
      this.res,
      client,
      'repos._githubReposGetHandler'
    );
  } else {
    responseObject.github = repo;

    client = new pg.Client( conString );

    queryString = 'SELECT * ' +
                  'FROM travalizit_builds ' +
                  'WHERE ' +
                    'owner_name = \'' + this.repoOwner + '\' ' +
                  'AND ' +
                    'repository_name = \'' + this.repoName + '\' ' +
                  'ORDER BY ' +
                    'number::int desc ' +
                  'LIMIT 20';

    client.connect( function( error ) {
      if ( error ) {
        repos._handleError(
          error,
          this.res,
          client,
          'repos._githubReposGetHandler - client.connect'
        );
      } else {
        client.query(
          queryString,
          function( error, result ) {
            if ( error ) {
              repos._handleError(
                error,
                this.res,
                client,
                'repos._githubReposGetHandler - client.connect - client.query'
              );
            } else {
              responseObject.builds = result.rows;

              if ( result.rows.length === 0 ) {
                countBuildFetch = -1;

                eventEmitter.emit(
                  'allFilesFetched',
                  responseObject,
                  this.res,
                  client
                );
              } else {

                result.rows.forEach( function( value ){
                  responseObject.nodes.push( {
                    name   : value.number,
                    type   : 'build',
                    status : value.status
                  } );
                } );

                repos._getBuildFiles(
                  responseObject,
                  repos._getBuildFilesHandler.bind( this )
                );
              }
            }
          }.bind( this )
        );
      }
    }.bind( this ) );
  }
};


repos._handleError = function( error, res, client, position ) {
  console.log( '_handle error function from ' + position );
  console.log( '*********************************************' );
  console.log( error );
  res.send( 500, error );

  if ( client ) {
    client.end();
  }
};


repos._removeDublicateNode = function( nodes ) {
  var names = [],
      newNodes = [];

  nodes.forEach( function( value ) {
    if ( ! ~names.indexOf( value.name ) ) {
      names.push( value.name );
      newNodes.push( value );
    }
  });

  return newNodes;
};


repos._sendResponse = function( responseObject, res, client ) {
  console.log( countBuildFetch + ' builds fetched');
  console.log( responseObject.builds.length - 1 );

  if ( countBuildFetch === responseObject.builds.length - 1 ) {
    responseObject.nodes = repos._removeDublicateNode( responseObject.nodes );
    res.send( responseObject );

    client.end();
  }
};
