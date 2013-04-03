# Core.io
---------------------------


## How to use?

  <script src="/lib/core.io/core.js"></script>

### Creating workers

  var worker = new Core.Worker('worker.js');


### Creating clusters

  var cluster = new Core.Cluster('worker.js');
  
  // Add new worker to cluster

  cluster.fork();

### Worker file

  // Export methods which can be called directly from master thread.

  exports.foo = function( arg ) {

    // The return value will be passed as first argument in master's callback fn.

    return arg;

  }

### Executing worker's functions

  worker.foo('bar', function(result) {

    // Result should be "bar"

  }

  // Calling functions from a cluster is auto load distributed to all workers

  cluster.foo('bar', function(result) {

    // Result should be "bar"

  }

### Evented I/O

Communication between master thread and worker's process can be done by emitting and listenning to events.

  // in worker.js

  worker.on('foo', function( arg ) {

    worker.emit('bar', arg);

  }

  // in main app

  worker.emit('foo', 'some value');

  worker.on('bar', function( arg ) {

    console.log(arg);

  }


## Worker (filename, options)


## Cluster (filename, options)


## Buffer (string, encoding)

