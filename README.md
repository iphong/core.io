CORE.JS
====================

Unleashed the power of your web apps, and free your UI. Core.js allows 
you to take control of the power of multi-core processing with ease.
Tasks like sending ajax requests and handling local files have become
very common nowadays in a standard web applications. And as you developers
might have noticed, this BLOCKS your UI, as more and more background tasks
are running. And when it comes to heavy tasks such as handling local files, 
your UI FREEZES. Users don't like it at all. In fact, for users like me, I
don't come back anymore. This is where developers go back to the the
conventional way of making web apps. It's to go page by page. So where is
the greatness of a single page app? The answer is Web Worker. Many web
apps have already implemented this. But working with web workers is rather
complicated and quite confusing for people that doesn't much experience.
And core.js is there for you. We did the hard work and you complete your
ideas.


EXAMPLES
====================

To create new worker:
    
    var worker = new Core.Worker('worker.js');

In your 'worker.js' file:
    
    // Include the core.js library
    importScripts('core.js');
    
    // Then write your worker codes here
    ...


So what is the different?

With core.js there are 2 ways to interact with your workers (More is on the way).

1. First is by emitting and listenning to events. For example:

In your main app.js:
    
    worker.emit('upload', file);

And in your worker.js
    
    worker.on('upload', function(file) {
        // Do your upload here
        ...
        
       // When upload is finished.
       worker.emit('done');
    });

Finally in your app.js
    
    worker.on('done', function() {
        // Do something here when upload finishes.
    });

2. Second is what called process stacking.

This simply put your requests in a queue stack. When you send new request to a busy
worker, it will be put on hold, and the worker will process it as soon as it finishes
the current task. And if multiple request are send, it will process one by one in the
order it was given.

For example:
    
in your worker.js:
    
    worker.stack(function( task, file ) {
        if (task=='calcMD5') {
            var result;
            // Do your MD5 calculation here
            ...
            
            // returned value will be the first argument
            // in the callback function.
            
            return result;
        }
    });

If your calculation requires asynchronous calls, don't return any value.
Use the next function instead. The next function is always the last argument.
    
    worker.stack(function( task, file, next ) {
        if (task=='calcMD5') {
            ajax('http://blah.com', function(result) {
                 // Do your MD5 calculation here
                ...
                
                callback(result);
            });
        }
    });

or simply:
    
    worker.stack(function( task, file, next ) {
        if (task=='calcMD5') {
            ajax('http://blah.com', next);
        }
    });


To push a new task to the worker stack, in your app.js, do this:

    worker.push('calcMD5', file, function( result ) {
        // Result is called back when this task is completed.
        ...
    });

If your stack queue is long, and you have an important job that requires
immediate process, in your app.js, do this:
    
    worker.next('upload', file, function() {
        // Call back when upload is finished
        ...
    });

This will tell the worker to do this task immediate, and continue with other
requests after.

If you want to cancel whatever the work is doing, and clear it queue stack.

In your app.js
    
    worker.stop(function() {
        // Callback when worker successfully stopped.
    });

The above code sends a stop signal to the worker, and as soon as the worker
receives the signal it will emit a 'quit' event back to comfirm.
    
If the worker takes too long to response, you can send a kill command to force
the worker process to end:
    
    worker.kill();

After this the worker is now free, and ready to receive another task.


// WORKER CLUSTER

-- Instruction for creating worker cluster is coming shortly.
-- Cluster provides process balancing using multiple workers.





    
