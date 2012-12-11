core.js
=======

DOCUMENTATION:

Modules
--------
Require modules:
    var foo = require('foo');
    var bar = require('./bar');
    var views = require('../lib/deploy/views.js');

Export modules:
    exports.foo = function() {
         /* function */
    }
    module.exports = function(){
        /* function */
    };
Workers
---------
Exec file in a new process:
    // From main script
    Core.exec('id3-parser.js', file, '.mp3', function(e, res) {
        /* Callback with result and terminate worker when done */
    });
    
    // Inside id3-parser.js
    var _ = require('underscore');
    var ID3 = require('core-id3');
    worker(function(file, type) {
        // Execute worker process here
        var tags = new ID3.parser(file);
        // Returning result will be passed as callback argument
        return tags;
    });

Spawn new worker:
    var worker = Core.spawn('worker.js');
    
    // Exchanging data between host and workers using events
    worker.emit('foo', 'some data');
    worker.on('bar', function(result) {
        /* render result here */
    });
    
    // Manipulating worker process stacks
    worker.stack('upload', file, callback);
    
    // Repeat the above code to add more job to worker's stack queue.
    // worker will execute one by one synchronously.
    
    // To squeeze in another task in the middle of the stack
    // for immediate process, use:
    worker.next('upload', important_file, callback);
    
    // The above request will be processed as soon as the current task
    // is completed.
    
    // Listen to events inside worker.js
    on('foo', function(data) {
        emit('bar', 'response data');
    });
    
    // Define worker's main function for process stacking
    worker(function(arg1[,arg2,...]) {
        /* Executing worker task here */
        
        return result;
    });
    