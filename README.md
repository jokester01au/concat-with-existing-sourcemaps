**mapcat** is a simple utility that concatenates JavaScript files while also
consolidating the corresponding source map files. It is useful if you use
compile-to-JS languages whose compiler emits source map files. This is the
case for CoffeeScript "transpiler" version 1.6 or later.

### API

You can use the simple API. It exposes one simple function:

    var bundle = require('concat-with-existing-sourcemaps').bundle;
	var source = [];
	var pair = {
		file: path/to/file.js,
		map: path/to/file.js.map
	};
	source.push(pair);
    bundle(source, 'output.js', 'out.js.map', [maproot]);

	Note: This api is using source root from the map file.