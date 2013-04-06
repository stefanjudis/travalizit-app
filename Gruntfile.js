module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    compass: {                  // Task
      dist: {                   // Target
        options: {              // Target options
          sassDir: 'lib/sass',
          cssDir: 'assets/css',
          environment: 'production'
        }
      },
      dev: {                    // Another target
        options: {
          sassDir: 'sass',
          cssDir: 'css'
        }
      }
    },

    pkg: grunt.file.readJSON('package.json'),

    // nodeunit: {
    //   all: ['test/**/*Test.js']
    // },
    //
    jshint: {
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile'],
        options: {
          nocase: true
        }
      },
      src: {
        files: ['lib/**/*', 'test/**/*.js', 'app.js', 'Gruntfile.js'],
        tasks: ['default']
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');

  // Default task.
  grunt.registerTask('default', ['jshint', 'compass']);
  //grunt.registerTask('travis', ['jshint', 'nodeunit']);
};
