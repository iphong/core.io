

// Avoid `console` errors in browsers that lack a console.
!function( root ) {
    var method;
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (root.console = root.console || {});
    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}(this);



(function( root ) {
	
	
	// Unique IDs to be used through out application session
	var uniqueIdCounter = 0;
	
	var uniqueID = function( prefix ) {
		return (prefix || "") + (uniqueIdCounter++);
	};
	
	var array = [];
	
	// Useful array functions;
	var slice = function( obj ) {
		return array.slice.apply(obj, array.slice.call(arguments, 1));
	};
	
	var unshift = function (obj) {
		array.unshift.apply(obj, slice(arguments, 1));
		return obj;
	};
	
	// Extend object props
	var extend = function ( obj ) {
		var obj = obj || {},
			args = slice(arguments, 1),
			props;
		while (props = args.shift()) {
			if (props instanceof Object) {
				for (var key in props) {
					obj[key] = props[key];
					if (props.hasOwnProperty(key)) {
						
					}
				}
			}
		}
		return obj;
	};
	
	// Save the previous value of Q & Class so it can be
	// restored with noConflict()
	var previousQ = root.Q;
	var previousClass = root.Class;
	
	// Top level Q object
	var Q = {};
	
	// Top level Class constructor
	var Class = function Class() {};
	
	// If core is loaded with AMD or on server, then export the top
	// level Q object.
	if (typeof exports !== 'undefined') {
		
		Q = exports;
		Q.Class = Class;
	}
	else {
	
		root['Q']  = Q;
		root['Class'] = Class;
		
		Q.noConflict = function() {
			root.Q = previousQ;
			return this;
		};
		
		Class.noConflict = function() {
			root.Class= previousClass;
			return this;
		};
	}
	
	// -- IMPORTANT -- //
	// The absolute path to the core.js script. ex. /app/js/lib/core.js
	// This required to be set on launch and will be used when spawning
	// workers. When define new workers and require additional modules, 
	// set their path in relative to this;
	// Examples:
	// new Q.Worker('workers/md5');
	// is located at --> /app/js/lib/workers/md5.js
	
	Q.path = undefined;
	
	// ---| CLASSES AND INHERITANCE |--
	
	// Create a new Class with provided prototype, and if parent Class
	// is set as first argument, new sub class will inherits its parent.
	
	Class.create = function( parent, protos, statics ) {
		
		if (typeof parent !== 'function') {
			var statics = protos;
			var protos = parent;
			var parent = this;
		}
		var	protos = protos || {},
			statics = statics || {};
		
		function subclass() { parent.apply(this,arguments); };
		
		if (protos.hasOwnProperty('constructor')) {
			subclass = protos.constructor;
			extend(statics, {
				constructor: { value: subclass }
			});
		}
		subclass.prototype = Object.create(parent.prototype, statics);
		subclass.create = Class.create;
		subclass.extend = Class.extend;
		
		extend(subclass.prototype, protos);
		
		this.superClass = parent;
		this.subClasses = [];
		if (parent.subclasses) {
			parent.subclasses.push(this);
		}
		return subclass;
	}
	
	// Create an extended version Class and SubClasses where the child
	// constructor gets merged with its accestors' constructor.
	// This is different with Class.create as Class.create() overrides
	// constructor method with the new one if provided, where Class.extend()
	// will merge its parent constructor to be executed at runtime.
	
	Class.extend = function( parent, protos, statics ) {
		
		if (typeof parent !== 'function') {
			var statics = protos;
			var protos = parent;
			var parent = this;
		}
		
		function init() {
			parent.apply(this,arguments);
			!ctor||ctor.apply(this,arguments);
		};
		function subclass() { init.apply(this,arguments); };
		
		if (protos.hasOwnProperty('constructor')) {
			var ctor = protos.constructor;
			try { subclass = eval('(function '+ctor.name+'() {\n\tinit.apply(this,arguments);\n})') }
			catch (e) { /* Prevent runtime error, where eval() isn't allowed. */ }
		}
		protos.constructor = subclass;
		
		return Class.create(parent, protos, statics);
	};
	
	// Make any existing Class Constructor to become Q.Class
	// with ability to extend sub classes.
	// This add the create() and extend() function to given Class.
	
	Class.bless = function( ctor ) {
	
		ctor.create = this.create;
		ctor.extend = this.extend;
		
		return ctor;
	};
	
	
	
	
	// This is borrowed from Backbone.Events 0.9.9
	// And all credit goes to all the developers who written
	// this awesome piece of code.
	
	var eventSplitter = /\s+/;
	
	var eventsApi = function (obj, action, name, rest) {
		if (!name) return true;
		if (typeof name === 'object') {
			for (var key in name) {
				obj[action].apply(obj, [key, name[key]].concat(rest));
			}
		} else if (eventSplitter.test(name)) {
			var names = name.split(eventSplitter);
			for (var i = 0, l = names.length; i < l; i++) {
				obj[action].apply(obj, [names[i]].concat(rest));
			}
		} else {
			return true;
		}
	};
	
	var triggerEvents = function (obj, events, args) {
		var ev, i = -1,
			l = events.length;
		switch (args.length) {
			case 0:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx);
				return;
			case 1:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, args[0]);
				return;
			case 2:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, args[0], args[1]);
				return;
			case 3:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
				return;
			default:
				while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
		}
	};
	
	// ---| EVENTS |--
	//
	// Q Events Class constructor.
	// This is the heart of Q Classes, they all extend this Events Class
	var Events = Q.Events = Class.create({
		
		constructor: function Events() {},
	
		on: function (name, callback, context) {
			if (!(eventsApi(this, 'on', name, [callback, context]) && callback)) return this;
			this._events || (this._events = {});
			var list = this._events[name] || (this._events[name] = []);
			list.push({
				callback: callback,
				context: context,
				ctx: context || this
			});
			return this;
		},
		
		off: function (name, callback, context) {
			var list, ev, events, names, i, l, j, k;
			if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
			if (!name && !callback && !context) {
				this._events = {};
				return this;
			}
			names = name ? [name] : Object.keys(this._events);
			for (i = 0, l = names.length; i < l; i++) {
				name = names[i];
				if (list = this._events[name]) {
					events = [];
					if (callback || context) {
						for (j = 0, k = list.length; j < k; j++) {
							ev = list[j];
							if ((callback && callback !== (ev.callback._callback || ev.callback)) || (context && context !== ev.context)) {
								events.push(ev);
							}
						}
					}
					this._events[name] = events;
				}
			}
			return this;
		},
		
		once: function (name, callback, context) {
			if (!(eventsApi(this, 'once', name, [callback, context]) && callback)) return this;
			var self = this;
			var once = function () {
				self.off(name, once, context);
				callback.apply(this, arguments);
			};
			this.on(name, once, context);
			this._callback = callback;
			return this;
		},
		
		trigger: function (name) {
			if (!this._events) return this;
			var args = slice(arguments, 1);
			if (!eventsApi(this, 'trigger', name, args)) return this;
			var events = this._events[name];
			var allEvents = this._events.all;
			if (events) triggerEvents(this, events, args);
			if (allEvents) triggerEvents(this, allEvents, arguments);
			return this;
		},
		
		attachListener: function (object, events, callback) {
			var listeners = this._listeners || (this._listeners = {});
			var id = object._listenerId || (object._listenerId = uniqueID('li'));
			listeners[id] = object;
			object.on(events, callback || this, this);
			return this;
		},
		
		removeListener: function (object, events, callback) {
			var listeners = this._listeners;
			if (!listeners) return;
			if (object) {
				object.off(events, callback, this);
				if (!events && !callback) delete listeners[object._listenerId];
			} else {
				for (var id in listeners) {
					listeners[id].off(null, null, this);
				}
				this._listeners = {};
			}
			return this;
		}
	});
	
	
	// ---| PROMISES |--
	//
	// Promise Class Constructor
	// return methods that trigger their appropriate events.
	var Promise = Q.Promise = Events.create({
		
		constructor: function Promise() {
			this.on('all', function( status ) {
				this.status = status;
				console.log('status');
			});
		},
		
		progress: function( callback, context ) {
			return this.once('progress', callback, context);
		},
		
		done: function( callback, context ) {
			return this.once('done', callback, context);
		},
		
		error: function( callback, context ) {
			return this.once('error', callback, context);
		}
	});
	
	
	// ---| WORKERS |--
	//
	
	// Single worker thread. You can exchange data among host app
	// and workers using events I/O or by stacking process with callbacks.
	// Stacking process is an advanced feature allow you to stack new jobs
	// on top or at bottom of current stack. Worker can be killed at 
	// anytime, if it freezes and free up valuable resources for your other
	// tasks without ever blocking your UI.
	
	// Examples:
	// -- worker = new Worker('worker.js');
	// -- worker.input( 'upload', file );
	
	var Worker = Q.Worker = Events.create({
		
		constructor: function Worker( filename ) {
			
			var worker = null,
				status = 'free',
				tasks = 0;
			
			Object.defineProperty(this, 'worker', {
				get: function() {
					if (!worker) {
						if (Q.path === undefined) {
							throw "Q.path is undefined.";
						}
						worker = new root.Worker( Q.path );
						worker.addEventListener('message', function(event) {
							this.trigger.apply(this, event.data);
						}.bind(this));
						this.emit('init', filename);
					}
					return worker;
				},
				set: function() {}
			});
			
			Object.defineProperty(this, 'status', {
			
				get: function() { return status; },
				set: function(newStatus) {
					if (status !== newStatus) {
						status = newStatus;
						this.trigger('status', newStatus);
						this.trigger('status:'+newStatus);
					}
				}
			});
			
			this.on('emit', function(type) {
				if (type == 'stack') {
					++tasks;
					this.status = 'busy';
				}
			});
			this.on('clear', function() {
				if (--tasks === 0) {
					this.status = 'free';
				}
			});
			this.on('exit quit kill', function() {
				tasks = 0;
				this.status = 'free';
				this.worker.terminate();
				worker = null;
			});
			return this;
		},
		
		emit: function( type ) {
			this.worker.postMessage(slice(arguments));
			this.trigger('emit', type);
			return this;
		},
		
		kill: function() {
			this.trigger('kill');
			return this;
		},
		
		stop: function() {
			this.status = 'stoping';
			this.emit('stop');
			return this;
		},
		
		stack: function( type ) {
			
			var id = uniqueID();
			var args = slice(arguments);
			var callback = (typeof args[args.length-1] == 'function') ? args.pop() : undefined;
			
			this.emit.apply(this, unshift(args, 'stack', id));
			this.once('stack:'+id, callback);
			
			return this;
		},
		
		push: function() {
			this.stack.apply(this, unshift(arguments, 'push'));
		},
		
		next: function() {
			this.stack.apply(this, unshift(arguments, 'next'));
		}
	});
	
	
	// Cluster is central router that spreads your tasks on to multiple
	// workers and load balance them. It gives you controls over how
	// tasks are sent to, and how results are received from workers.
	
	// Examples:
	// -- cluster = new Q.Cluster('worker.js', 4);
	// -- cluster.input( 'render', data ).progress(function(){ ... }).done(function( result ){ ... });
	
	var Cluster = Q.Cluster = Events.create({
		
		constructor: function Cluster( filename, number ) {
			
			this.workers = [];
			this.stackQueue = [];
			this.stackCount = 0;
			this.filename = filename;
			
			this.addWorker(number);
		},
		
		shift: function() {
		
			if (this.stackQueue.length == 0 || this.workers.length == 0) return;
			var promise = this.stackQueue.shift();
			var worker = this.workers.shift();
			
			promise.worker = worker;
			promise.trigger('progress', worker);
			
			worker.next.apply( worker, promise.args.concat([ promise.trigger.bind( promise, 'done' ) ]) );
			
			return this;
		},
		
		stack: function( method ) {
		
			var promise = new Promise;
			
			promise.status = 'pending';
			promise.args = slice(arguments, 1);
			
			setTimeout(function() {
				
				this.stackCount++;
				this.stackQueue[method](promise);
				this.shift();
				
			}.bind(this), 1);
				
			return promise;
		},
		
		push: function() {
			return this.stack.apply(this, unshift(arguments, 'push'));
		},
		
		next: function() {
			return this.stack.apply(this, unshift(arguments, 'unshift'));
		},
		
		addWorker: function(number) {
		
			number||(number=1);
			
			for (var i=number; i>0; i--) {
				
				!function(number) {
					
					var worker = Q.spawn( this.filename ).on('clear', function( id ) {
						if (--this.stackCount == 0) {
							this.trigger('clear');
						}
						this.workers.push(worker);
						this.shift();
					}, this);
					
					this.workers.push(worker);
					
					this.shift()
					
				}.call(this, i);
			}
			return this;
		},
		
		removeWorker: function(number) {
			number||(number=1);
			
			while (number-- > 0) {
				if (this.workers.length == 1) return this;
				var worker = this.workers.pop();
				if (worker) {
					worker.kill();
				}
			}
			return this;
		}
	});
	
	
	// This create a worker object in the WorkerScope that provides
	// you a set of tools for communicating with your host app.
	
	// Examples:
	// -- worker.input(function( cmd, data ){ ... });
	
	var Helper = Q.Helper = Events.create({
		
		constructor: function Helper() {
		
			var worker = this;
			
			self.addEventListener('message', function(event) {
				worker.trigger.apply(worker, event.data);
			});
			this.on('stop', this.emit.bind(this, 'quit'));
			this.once('init', require);
		},
		
		emit: function( type ) {
			self.postMessage(slice(arguments));
			return this;
		},
		
		stack: function( handler ) {
			
			this.on('stack', function( id, type ) {
				
				this.once('clear:'+id, function() {
					this.emit.apply(this, unshift(arguments, 'stack:'+id));
					this.emit( 'clear', id );
				})
				
				var args = slice(arguments, 2).concat([ this.trigger.bind(this, 'clear:'+id) ]);
				
				var exec = function() {
					var result = handler.apply(this, args);
					if (result !== undefined) {
						this.trigger('clear:'+id, result);
					}
				}
				.bind(this);
				
				type == 'next' ? exec() : setTimeout(exec, 1);
			});
		}
	});
	
	
	
	// ---| MODULES |--
	// 
	// NOTE: This is a Synchronous Module Loader that should NOT be use
	// to require modules for your UI. Instead, use other AMD Module loader
	// such as require.js and curl.js.
	
	var Module = Q.Module = Events.extend({
		
		// Module Class Constructor
		constructor: function Module(id, parent) {
			this.id = id;
			this.parent = parent;
			this.exports = {};
		},
		// Comile given source code in a contained closure and return its exported value;
		// No Q local variables is exposed to module local scope.
		// Module globals: global, module, exports, require, __dirname, __filename 
		compile: function( source, filename ) {
			
			var module = this;
			
			this.filename = filename;
			
			var require = function( request ) {
				
				return Module.load( request, module );
			};
			
			var context = new Function('global','module','exports', 'require','__dirname','__filename', source);
			
			var result = context( root, module, module.exports, require, path.dirname(filename), filename );
			
			return module.exports;
		}
	});
	
	// All loaded modules are cached in this object indexed by filename.
	// Everytime application call require, module will be served from cache
	// if existed.
	Module._cached = {};
	
	// Resolve file path in relation to its parent
	Module.resolveFilename = function( request, parent ) {
		
		var ext = path.extname(request) || '.js';
		var basename = path.basename(request, ext);
		
		var fromDir = path.dirname(parent.filename||parent.id);
		
		if ((/^([^\.|\/]+)/).exec(request)) {// without leading dot or slash
		
			var toPath = path.resolve( path.dirname(location.pathname), request );
		}
		else {
			var toPath = path.resolve( fromDir, request );
		}
		
		var toDir = path.dirname(toPath);
		var toFile = path.basename(toPath, ext) + ext;
		
		var resolved = path.join(toDir, toFile);
		
		return resolved;
	};
	
	// Make a synchronous ajax request to retrieve the source file
	// return xhr.responseText
	Module.get = function( filename ) {
	
		var xhr = new XMLHttpRequest;
		
		xhr.open('GET', filename, false);
		xhr.send();
		
		return xhr.status == 200 ? xhr.responseText : false;
	};
	
	// Module loader function which resolves filename from request,
	// sends ajax calls, constructs and caches modules.
	// This processes the module loading progress from start to end.
	Module.load = function( request, parent ) {
	
	var filename = Module.resolveFilename(request, parent);
	if (Module._cached[filename] !== undefined) return Module._cached[filename].exports;
	
	var source = Module.get(filename);
	if (!source) return false;
	
	var module = Module._cached[filename] = new Module(request,parent);
	
	return module.compile( source, filename );
};

	
	
	// ---------
	
	var path = {
		
		sep: '/',
		delimiter: ':',
		splitPathRe: /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/,
		
		splitPath: function (filename) {
			var result = this.splitPathRe.exec(filename);
			return [result[1] || "", result[2] || "", result[3] || "", result[4] || ""]
		},
		normalizeArray: function (parts, allowAboveRoot) {
			var up = 0;
			for(var i = parts.length - 1; i >= 0; i--) {
				var last = parts[i];
				if(last === ".") {
					parts.splice(i, 1)
				} else {
					if(last === "..") {
						parts.splice(i, 1);
						up++
					} else {
						if(up) {
							parts.splice(i, 1);
							up--
						}
					}
				}
			}
			if(allowAboveRoot) {
				for(; up--; up) {
					parts.unshift("..")
				}
			}
			return parts
		},
		resolve: function() {
			var resolvedPath = "",
				resolvedAbsolute = false;
			for(var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
				var path = (i >= 0) ? arguments[i] : "/";
				if(typeof path !== "string" || !path) {
					continue
				}
				resolvedPath = path + "/" + resolvedPath;
				resolvedAbsolute = path.charAt(0) === "/"
			}
			resolvedPath = this.normalizeArray(resolvedPath.split("/").filter(function (p) {
				return !!p
			}), !resolvedAbsolute).join("/");
			return((resolvedAbsolute ? "/" : "") + resolvedPath) || "."
		},
		relative: function( from, to ) {
			from = this.resolve(from).substr(1);
			to = this.resolve(to).substr(1);
	
			function trim(arr) {
				var start = 0;
				for(; start < arr.length; start++) {
					if(arr[start] !== "") {
						break
					}
				}
				var end = arr.length - 1;
				for(; end >= 0; end--) {
					if(arr[end] !== "") {
						break
					}
				}
				if(start > end) {
					return []
				}
				return arr.slice(start, end - start + 1)
			}
			var fromParts = trim(from.split("/"));
			var toParts = trim(to.split("/"));
			var length = Math.min(fromParts.length, toParts.length);
			var samePartsLength = length;
			for(var i = 0; i < length; i++) {
				if(fromParts[i] !== toParts[i]) {
					samePartsLength = i;
					break
				}
			}
			var outputParts = [];
			for(var i = samePartsLength; i < fromParts.length; i++) {
				outputParts.push("..")
			}
			outputParts = outputParts.concat(toParts.slice(samePartsLength));
			return outputParts.join("/")
		},
		normalize: function(path) {
			var isAbsolute = path.charAt(0) === "/",
				trailingSlash = path.substr(-1) === "/";
			path = this.normalizeArray(path.split("/").filter(function (p) {
				return !!p
			}), !isAbsolute).join("/");
			if(!path && !isAbsolute) {
				path = "."
			}
			if(path && trailingSlash) {
				path += "/"
			}
			return(isAbsolute ? "/" : "") + path
		},
		basename: function( path, ext ) {
			var f = this.splitPath(path)[2];
			if(ext && f.substr(-1 * ext.length) === ext) {
				f = f.substr(0, f.length - ext.length)
			}
			return f
		},
		dirname: function(path) {
			var result = this.splitPath(path),
				root = result[0],
				dir = result[1];
			if(!root && !dir) {
				return "."
			}
			if(dir) {
				dir = dir.substr(0, dir.length - 1)
			}
			return root + dir
		},
		extname: function(path) {
			return this.splitPath(path)[3];
		},
		join: function() {
			var paths = slice(arguments);
			return this.normalize(paths.filter(function (p, index) {
				return p && typeof p === "string"
			}).join("/"))
		}
	};
	
	if (!root.window) {
		
		var module = new Module('.');
		
		module.filename = location.pathname;
		
		root.require = function( request ) {
			return Module.load(request, module);
		};
		
		root.worker = new Helper;
	}
	
	
})(this);



