var path = require("path"),
    fs = require("fs");

var BannerPlugin = require("webpack/lib/BannerPlugin");

module.exports = function(grunt) {
  grunt.loadTasks('scripts/grunt');
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-protractor');
  grunt.loadNpmTasks('grunt-jade-l10n-extractor');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  // Ripple client dependencies
  var deps = ["deps/js/jquery/jquery.min.js",
              "deps/js/swfobject.js",
              "deps/js/setImmediate.js",
              "deps/js/underscore/underscore-min.js",
              "deps/js/downloadify.js",
              "deps/js/angular/angular.min.js",
              "deps/js/angular-route/angular-route.min.js",
              "deps/js/store.js/store.min.js",
              "deps/js/ripple.js",
              "deps/js/ripple-sjcl.js",
              "deps/js/moment/min/moment.min.js",
              "deps/js/bootstrap-modal.js",
              "deps/js/bootstrap-tooltip.js",
              "deps/js/bootstrap-popover.js",
              "deps/js/bootstrap-datepicker.js",
              "deps/js/jquery.qrcode.min.js",
              "deps/js/spin.js/dist/spin.min.js",
              "deps/js/snapjs/snap.min.js"];

  var compat_ie = ["compat/ie/base64/base64.js",
                 "compat/ie/ws/web_socket.js",
                 "compat/ie/ws/config.js",
                 "compat/ie/xdr/xdr.js"];

  var compat_nw = ["compat/nw/setImmediate/setImmediate.js"];

  /**
   * Returns true if the source is newer than the destination.
   */
  var isNewer = function (src,dest) {
    if (!fs.existsSync(dest)) {
      return true;
    }
    var fromstat = fs.statSync(src);
    var tostat = fs.statSync(dest);
    return fromstat.mtime > tostat.mtime;
  };

  /**
   * Where there are many files that compile to one, this returns true
   * if any of the input files are newer than the output.
   */
  var manyToOne = function (dest, src) {
    var compile = true;
    if (fs.existsSync(dest)) {
      var from = grunt.file.expand(src);
      var tostat = fs.statSync(dest);
      compile = false;
      for (var i = from.length - 1; i >= 0; i--) {
        if (fs.statSync(from[i]).mtime > tostat.mtime) {
          compile = true;
          break;
        }
      }
    }
    return [{dest:dest, src:compile?src:[]}];
  };

  grunt.registerTask("version", "Describes current git commit", function (prop) {
    var done = this.async();

    grunt.log.write("Version: ");

    grunt.util.spawn({
      cmd : "git",
      args : [ "describe", "--tags", "--always", "--dirty" ]
    }, function (err, result) {
      if (err) {
        grunt.log.error(err);
        return done(false);
      }

      grunt.config(prop || "meta.version", result.stdout);

      grunt.log.writeln(result.stdout.green);

      done(result);
    });
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {},
    recess: {
      web: {
        src: ['src/less/ripple/web.less'],
        dest: 'build/dist/ripple-web.css',
        options: {
          compile: true
        }
      },
      desktop: {
        src: ['src/less/ripple/desktop.less'],
        dest: 'build/dist/ripple-desktop.css',
        options: {
          compile: true
        }
      }
    },
    webpack: {
      options: {
        entry: "./src/js/entry/desktop.js",
        module: {
          preLoaders: [
            {
              test: /\.js$/,
              include: pathToRegExp(path.join(__dirname, 'src', 'js')),
              loader: "jshint-loader"
            }
          ]
        },
        output: {
          path: "build/dist/"
        },
        cache: true,
        jshint: {
          "validthis": true,
          "laxcomma" : true,
          "laxbreak" : true,
          "browser"  : true,
          "eqnull"   : true,
          "debug"    : true,
          "devel"    : true,
          "boss"     : true,
          "expr"     : true,
          "asi"      : true,
          "sub"      : true
        },
        plugins: [
          new BannerPlugin("Ripple Client v<%= meta.version %>\nCopyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\nLicensed under the <%= pkg.license %> license.")
        ]
      },
      desktop: {
        module: {
          loaders: [
            { test: /\.jade$/, loader: "jade-l10n-loader" }
          ]
        },
        output: {
          filename: "<%= pkg.name %>-desktop.js"
        },
        optimize: {
          minimize: true
        }
      },
      desktop_debug: {
        module: {
          loaders: [
            { test: /\.jade$/, loader: "jade-l10n-loader" }
          ]
        },
        output: {
          filename: "<%= pkg.name %>-desktop-debug.js"
        },
        debug: true,
        devtool: 'eval'
      },
      chinese: {
        module: {
          loaders: [
            { test: /\.jade$/, loader: "jade-l10n-loader?languageFile=./l10n/cn/messages.po" }
          ]
        },
        output: {
          filename: "<%= pkg.name %>-desktop-cn.js"
        },
        optimize: {
          minimize: true
        }
      },
      italian: {
        module: {
          loaders: [
            { test: /\.jade$/, loader: "jade-l10n-loader?languageFile=./l10n/it/messages.po" }
          ]
        },
        output: {
          filename: "<%= pkg.name %>-desktop-it.js"
        },
        optimize: {
          minimize: true
        }
      },
      dutch: {
        module: {
          loaders: [
            { test: /\.jade$/, loader: "jade-l10n-loader?languageFile=./l10n/nl/messages.po" }
          ]
        },
        output: {
          filename: "<%= pkg.name %>-desktop-nl.js"
        },
        optimize: {
          minimize: true
        }
      },
      polish: {
        module: {
          loaders: [
            { test: /\.jade$/, loader: "jade-l10n-loader?languageFile=./l10n/pl/messages.po" }
          ]
        },
        output: {
          filename: "<%= pkg.name %>-desktop-pl.js"
        },
        optimize: {
          minimize: true
        }
      },
      spanish: {
        module: {
          loaders: [
            { test: /\.jade$/, loader: "jade-l10n-loader?languageFile=./l10n/es/messages.po" }
          ]
        },
        output: {
          filename: "<%= pkg.name %>-desktop-es.js"
        },
        optimize: {
          minimize: true
        }
      }
    },
    concat: {
      deps: {
        src: deps,
        cwd: 'build/',
        dest: 'build/dist/deps.js',
        separator: ';'
      },
      deps_debug: {
        src: deps,
        dest: 'build/dist/deps-debug.js',
        separator: ';'
      },
      compat_ie: {
        src: compat_ie,
        cwd: 'build/',
        dest: 'build/dist/compat_ie.js'
      },
      compat_ie_debug: {
        src: compat_ie,
        dest: 'build/dist/compat_ie-debug.js'
      },
      compat_nw: {
        src: compat_nw,
        cwd: 'build/',
        dest: 'build/dist/compat_nw.js'
      },
      compat_nw_debug: {
        src: compat_nw,
        dest: 'build/dist/compat_nw-debug.js'
      }
    },
    uglify: {
      // JavaScript dependencies
      deps: {
        expand: true,
        src: deps,
        dest: "build/",
        filter: function (from) {
          return isNewer(from, "build/"+from);
        }
      },
      compat_ie: {
        expand: true,
        src: compat_ie,
        dest: "build/",
        filter: function (from) {
          return isNewer(from, "build/"+from);
        }
      },
      compat_nw: {
        expand: true,
        src: compat_nw,
        dest: "build/",
        filter: function (from) {
          return isNewer(from, "build/"+from);
        }
      }
    },
    preprocess: {
      web: {
        src: 'index.html',
        dest: 'build/dist/index.html',
        options: {
          context: {
            MODE: "release",
            TARGET: "web",
            VERSION: "<%= meta.version %>"
          }
        }
      },
      web_debug: {
        src: 'index.html',
        dest: 'build/dist/index_debug.html',
        options: {
          context: {
            MODE: "debug",
            TARGET: "web",
            VERSION: "<%= meta.version %>"
          }
        }
      },
      desktop: {
        src: 'index.html',
        dest: 'build/dist/index_desktop.html',
        options: {
          context: {
            MODE: "release",
            TARGET: "desktop",
            VERSION: "<%= meta.version %>"
          }
        }
      },
      desktop_debug: {
        src: 'index.html',
        dest: 'build/dist/index_desktop_debug.html',
        options: {
          context: {
            MODE: "debug",
            TARGET: "desktop",
            VERSION: "<%= meta.version %>"
          }
        }
      }
    },
    copy: {
      web: {
        files: [
          {expand: true, src: ['build/dist/*.js'], dest: 'build/bundle/web'},
          {expand: true, src: ['build/dist/*.css'], dest: 'build/bundle/web'},
          {expand: true, src: ['build/dist/*.html'], dest: 'build/bundle/web', flatten: true},
          {expand: true, src: ['fonts/*'], dest: 'build/bundle/web'},
          {expand: true, src: ['img/**'], dest: 'build/bundle/web'},
          {expand: true, src: ['deps/js/modernizr*.js'], dest: 'build/bundle/web'},
          {expand: true, src: ['deps/js/mixpanel.js'], dest: 'build/bundle/web'},
          {src: 'config-example.js', dest: 'build/bundle/web/config-example.js'}
        ]
      },
      nw_desktop: {
        files: [
          {expand: true, src: ['build/dist/*.js'], dest: 'build/bundle/nw-desktop'},
          {expand: true, src: ['build/dist/*.css'], dest: 'build/bundle/nw-desktop'},
          {expand: true, src: ['fonts/*'], dest: 'build/bundle/nw-desktop'},
          {expand: true, src: ['img/**'], dest: 'build/bundle/nw-desktop'},
          {expand: true, src: ['deps/js/modernizr*.js'], dest: 'build/bundle/nw-desktop'},
          {expand: true, src: ['deps/js/mixpanel.js'], dest: 'build/bundle/nw-desktop'},
          {src: 'build/dist/index_desktop.html', dest: 'build/bundle/nw-desktop/index.html'},
          {src: 'res/nw/package_desktop.json', dest: 'build/bundle/nw-desktop/package.json'},
          {src: 'config-example.js', dest: 'build/bundle/nw-desktop/config.js'}
        ]
      },
      nw_desktop_debug: {
        files: [
          {expand: true, src: ['build/dist/*.js'], dest: 'build/bundle/nw-desktop-debug'},
          {expand: true, src: ['build/dist/*.css'], dest: 'build/bundle/nw-desktop-debug'},
          {expand: true, src: ['fonts/*'], dest: 'build/bundle/nw-desktop-debug'},
          {expand: true, src: ['img/**'], dest: 'build/bundle/nw-desktop-debug'},
          {expand: true, src: ['deps/js/modernizr*.js'], dest: 'build/bundle/nw-desktop-debug'},
          {expand: true, src: ['deps/js/mixpanel.js'], dest: 'build/bundle/nw-desktop-debug'},
          {src: 'build/dist/index_desktop_debug.html', dest: 'build/bundle/nw-desktop-debug/index.html'},
          {src: 'res/nw/package_desktop_debug.json', dest: 'build/bundle/nw-desktop-debug/package.json'},
          {src: 'config-example.js', dest: 'build/bundle/nw-desktop-debug/config.js'}
        ]
      }
    },
    jade_l10n_extractor: {
      templates: {
        options: {
        },
        files: [
          { src: ['src/jade/**/*.jade'], dest: 'l10n/templates/messages.pot' }
        ]
      }
    },
    watch: {
      livereload: {
        files: ['build/css/**/*.css'],
        tasks: [],
        options: { livereload: true }
      },
      scripts_debug: {
        files: ['src/js/**/*.js', 'src/jade/**/*.jade'],
        tasks: ['webpack:desktop_debug'],
        options: { nospawn: true, livereload: true }
      },
      deps: {
        files: ['<%= concat.deps.src %>'],
        tasks: ['concat:deps_debug'],
        options: { livereload: true }
      },
      styles: {
        files: 'src/less/**/*.less',
        tasks: 'recess',
        options: { livereload:true }
      },
      index: {
        files: ['index.html'],
        tasks: ['preprocess'],
        options: { livereload:true }
      },
      config: {
        files: ['config.js'],
        options: { livereload:true }
      }
    },
    connect: {
      debug: {
        options: {
          hostname: 'localhost',
          port: 8005,
          base: '.',
          open: false,
          middleware: function(connect, options) {
            return [
              connect['static'](options.base)
            ]
          }
        }
      }
    },
    mochaProtractor: {
      local: {
        options: {
          reporter: 'Spec',
          browsers: ['Chrome', 'Firefox']
        },
        files: {
          src: 'test/e2e/*.js'
        }
      }
    },
    nodewebkit: {
      desktop: {
        options: {
          build_dir: 'build/pkg/nw/',
          win: true,
          mac: true,
          linux32: true,
          linux64: true
        },
        files: {
          src: 'build/bundle/nw-desktop/**/*'
        }
      }
    }
  });

  // Tasks
  // -----

  // Default - builds the web version of the client
  grunt.registerTask('default', ['version',
                                 'preprocess',
                                 'webpack',
                                 'recess',
                                 'deps']);

  // Deps only - only rebuilds the dependencies
  grunt.registerTask('deps', ['uglify:deps',
                              'concat:deps','concat:deps_debug',
                              'uglify:compat_ie',
                              'concat:compat_ie', 'concat:compat_ie_debug',
                              'uglify:compat_nw',
                              'concat:compat_nw', 'concat:compat_nw_debug']);

  // Distribution build - builds absolutely everything
  grunt.registerTask('dist', ['default',
                              'copy:web', 'copy:nw_desktop', 'copy:nw_desktop_debug',
                              'nodewebkit:desktop']);

  // End-to-end tests
  grunt.registerTask('e2e', ['connect:debug', 'mochaProtractor:local']);

  // Start server with auto-recompilation
  grunt.registerTask('serve', ['connect:debug', 'watch']);
};
// Helpers
function escapeRegExpString(str) { return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); }
function pathToRegExp(p) { return new RegExp("^" + escapeRegExpString(p)); }
