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

### Inside worker.js

    // Export methods which can be called directly from master thread.
    exports.foo = function( arg ) {
      // The return value will be passed as first argument in master's callback fn.
      return arg;
    }

### Executing worker functions

    worker.foo('bar', function(result) {
      // Result should be "bar"
    }

    // Calling functions from a cluster is auto load distributed to all workers
    cluster.foo('bar', function(result) {
      // Result should be "bar"
    }

### Evented I/O transactions

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


## Documentation


### Core.Class

Base class constructor. All core.io classes are subclass of this.

#### Class.define( parent, protos );

Create a new subclass based on any given parent. If a constructor function is provided, it will override the super' constructor function.

#### Class.extend( parent, protos );

Create a new subclass based on any given parent. If a constructor function is provided, it will be merged with super constructor function. In another word, it extends the super constructor function.

#### inst.define

#### inst.getter

#### inst.setter

#### inst.watch


### Core.Events

Base event emitter. most Core.IO Classes are subclass of this.

#### events.on

#### events.off

#### events.once

#### events.trigger

#### events.listenTo

#### events.stopListenning


### Core.Worker (filename, options)

Worker is a subclass of Events.

#### worker.emit

#### worker.exec

#### worker.bind

#### worker.kill

#### worker.exit


### Core.Cluster (filename, options)

Cluster instances share all Worker methods, there for usage is identical. The only different is cluster automatically distributes stack call to all of its workers evenly.


### Core.Promise

When worker executes a function it return an instance of Promise(). Events bound to this object is triggered only within the progress of that execution. once the function returns, or a complete event is emitted, This object won't be receiving any more events from the worker.

#### promise.init

#### promise.progress

#### promise.done


### Core.Buffer (string, encoding)

