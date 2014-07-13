var async = require('async');

module.exports = function (grunt) {
    grunt.registerMultiTask("mongoimport", "Grunt task for importing data into mongodb", function () {

        var done = this.async(),
            options = this.options(),
            files = this.filesSrc;

        async.eachSeries(files, function (filepath, callback) {
                //customise to read and remove newlines from multiple json files
                var args = [],
                    filename = /[^\\/]*(?=[.][\w]+$)/.exec(filepath),
                    filecontents = grunt.file.read(filepath).replace(/(\r\n|\n|\r)/gm, ""),
                    minFilePath = /[^*]*(?=[.][\w]+$)/.exec(filepath) + ".min.json";

                grunt.log.verbose.writeln(["filepath: " + filepath]);
                grunt.log.verbose.writeln(["filename: " + filename]);
                grunt.log.verbose.writeln(["minFilePath: " + minFilePath]);
                grunt.log.verbose.writeln(["filecontents: " + filecontents]);

                //delete existing minified files
                if (grunt.file.exists(minFilePath)) {
                    grunt.file.delete(minFilePath);
                }
                //save minified version
                grunt.file.write(minFilePath, filecontents);

                args.push('--file=' + minFilePath);

                if (options.db) args.push('--db=' + options.db);
                if (options.host) args.push('--host=' + options.host);
                if (options.port) args.push('--port=' + options.port);
                if (options.username) args.push('--db=' + options.username);
                if (options.password) args.push('--db=' + options.password);
                if (options.stopOnError) args.push('--stopOnError');

                if (filename) args.push('--collection=' + filename);
                if (options.type) args.push('--type=' + options.type);
                if (options.fields) args.push('--fields=' + options.fields);
                if (options.upsertFields) args.push('--upsertFields=' + options.upsertFields);
                if (options.jsonArray) args.push('--jsonArray');
                if (options.upsert) args.push('--upsert');
                if (options.drop) args.push('--drop');

                var child = grunt.util.spawn({
                        cmd: options.mongoPath + '/mongoimport',
                        args: args,
                        opts:
                        {
                            stdio:
                                [process.stdin
                                    , process.stout
                                    , process.stderr
                                ]
                        }
                    },
                    function (error, result) {
                        if (error) {
                            grunt.log.error(result.stderr);
                            //delete file
                            grunt.file.delete(minFilePath);
                            callback();
                        }
                        grunt.log.writeln(result.stdout);
                        //delete file
                        grunt.file.delete(minFilePath);
                        callback();
                    });
            },
            function (err) {
                if (err) done(false);
                done();
            }
        );
    });
};
