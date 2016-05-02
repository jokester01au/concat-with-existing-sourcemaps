var SourceMapConsumer, SourceMapGenerator, existsSync, mkdirSync, path, readFileSync, ref, ref1, statSync, writeFileSync;

ref = require('fs'), readFileSync = ref.readFileSync, writeFileSync = ref.writeFileSync, existsSync = ref.existsSync, mkdirSync = ref.mkdirSync, statSync = ref.statSync;

path = require('path');

ref1 = require('source-map'), SourceMapConsumer = ref1.SourceMapConsumer, SourceMapGenerator = ref1.SourceMapGenerator;

exports.bundle = function(inputFiles, outFile, outMapFile, maproot) {
  var buffer, e, error, error1, error2, f, fileExist, generator, isCSS, j, len, lineOffset, map, mapExist, src;
  buffer = [];
  generator = new SourceMapGenerator({
    file: outFile
  });
  lineOffset = 0;
  isCSS = outFile.indexOf('css') !== -1;
  for (j = 0, len = inputFiles.length; j < len; j++) {
    f = inputFiles[j];
    try {
      mapExist = statSync(f.map);
      fileExist = statSync(f.file);
    } catch (error) {
      e = error;
      console.error('Bundling error:  does not exist! Verify your source.');
      console.error('Missing file: ' + e.path);
      continue;
    }
    map = new SourceMapConsumer(readFileSync(f.map, 'utf-8'));
    src = readFileSync(f.file, 'utf-8');
    src = isCSS ? src.replace(/\/\/[@#]\ssourceMappingURL[^\r\n]*/g, '//') : src.replace(/\/\*[@#]\ssourceMappingURL[^\r\n]*/g, '/**/');
    buffer.push(src);
    try {
      map.eachMapping(function(mapping) {
        mapping = {
          generated: {
            line: mapping.generatedLine + lineOffset,
            column: mapping.generatedColumn
          },
          original: {
            line: mapping.originalLine,
            column: mapping.originalColumn
          },
          source: mapping.source,
          name: mapping.name
        };
        return generator.addMapping(mapping);
      });
      map.sourcesContent.forEach(function(sourceContent, i) {
        return generator.setSourceContent(map.sources[i], sourceContent);
      });
    } catch (error1) {
      e = error1;
      continue;
    }
    lineOffset += src.split('\n').length;
  }
  if (!maproot) {
    if (isCSS) {
      buffer.push("/*# sourceMappingURL=" + (path.relative(path.dirname(outFile), outMapFile)) + "*/");
    } else {
      buffer.push("//# sourceMappingURL=" + (path.relative(path.dirname(outFile), outMapFile)));
    }
  } else {
    if (isCSS) {
      buffer.push("/*# sourceMappingURL=" + (maproot + path.relative(path.dirname(outFile), outMapFile)) + "*/");
    } else {
      buffer.push("//# sourceMappingURL=" + (maproot + path.relative(path.dirname(outFile), outMapFile)));
    }
  }
  outFile.split('/').reduce(function(prev, curr, i) {
    if (existsSync(prev) === false) {
      mkdirSync(prev);
    }
    return prev + '/' + curr;
  });
  try {
    writeFileSync(outFile, buffer.join('\n'), 'utf-8');
    return writeFileSync(outMapFile, generator.toString(), 'utf-8');
  } catch (error2) {
    e = error2;
    return console.error('[CONCAT-WITH-EXISTING-SOURCEMAPS] Could not write bundle! File is in use?\n' + e);
  }
};
