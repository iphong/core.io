core.js
=======

DOCUMENTATION:

To init new webapp instance:

	core.app('main/myapp.js');


Inside myapp.js

	require('.views');
	require('.widgets');

	var _ = require('underscore');
	var foo = require('.module/foo');
	var bar = require('../views/bar');

	app.insertView(bar);
	app.insertView('mycustomview');
	app.events({
		'click button.post': foo.post
	});
	app.on('login', foo.sayHello);
	app.on('load', function() {
		core.log('Application instance loaded');
	});
	app.on('error', function() {
		core.inspect(error)
	});
	app.routes({
		'post/:id': bar.render,
		'logout': app.close
	});
	foo.on('data', bar.showData);
	foo.on('message', app.notify);

	app.render();