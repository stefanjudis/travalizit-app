module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    compass : {                  // Task
      dist : {                   // Target
        options: {              // Target options
          sassDir        : 'lib/sass',
          cssDir         : 'assets/css',
          environment    : 'production',
          imagesDir      : 'assets/images',
          raw            : 'http_images_path = \'/images\' \nhttp_generated_images_path = \'/images\''
        }
      },
      dev : {                    // Another target
        options : {
          sassDir : 'sass',
          cssDir  : 'css'
        }
      }
    },

    csscss : {
      options : {
        colorize         : true,
        showParserErrors : true,
        minMatch         : 5
      },
      dist : {
        src : [ 'assets/css/app.css' ]
      }

    },

    pkg: grunt.file.readJSON( 'package.json' ),

    // nodeunit: {
    //   all: ['test/**/*Test.js']
    // },
    //
    jshint : {
      all : [
        'Gruntfile.js',
        'lib/**/*.js',
        'assets/js/collections/*.js',
        'assets/js/config/*.js',
        'assets/js/models/*.js',
        'assets/js/views/**/*.js',
        'test/**/*.js'
      ],
      options : {
        jshintrc : '.jshintrc'
      }
    },

    watch : {
      gruntfile : {
        files   : 'Gruntfile.js',
        tasks   : [ 'jshint:gruntfile' ],
        options : {
          nocase : true
        }
      },
      src : {
        files : [ 'lib/**/*', 'test/**/*.js', 'assets/**/*.*', 'app.js', 'Gruntfile.js' ],
        tasks : [ 'default' ]
      }
    }
  });


  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-compass' );
  grunt.loadNpmTasks('grunt-csscss');
  //grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );

  // Default task.
  grunt.registerTask( 'default', [ 'compass', 'jshint', 'csscss' ]);
  //grunt.registerTask('travis', ['jshint', 'nodeunit']);
};
