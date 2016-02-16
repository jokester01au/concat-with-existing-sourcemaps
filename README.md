**concat-with-existing-sourcemaps** is a simple utility that concatenates JavaScript files while also
consolidating the corresponding source map files.

Based on mapcat by Eddie Cao

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