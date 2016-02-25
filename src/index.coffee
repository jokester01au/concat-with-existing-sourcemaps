{readFileSync, writeFileSync, existsSync, mkdirSync, statSync} = require('fs')
path = require('path')
{SourceMapConsumer, SourceMapGenerator} = require('source-map')

exports.bundle = (inputFiles, outFile, outMapFile, maproot) ->
    buffer = []
    generator = new SourceMapGenerator
        file: outFile

    lineOffset = 0
    isCSS = outFile.indexOf('css') != -1

    for f in inputFiles
        try
            mapExist = statSync(f.map)
            fileExist = statSync(f.file)
        catch e
            console.error('Bundling error:  does not exist! Verify your source.');
            console.error('Missing file: '+ e.path);
            continue

        map = new SourceMapConsumer(readFileSync(f.map, 'utf-8'))

        # concatenate the file
        src = readFileSync(f.file, 'utf-8')
        src = if isCSS then src.replace(/\/\/[@#]\ssourceMappingURL[^\r\n]*/g, '//') else src.replace(/\/\*[@#]\ssourceMappingURL[^\r\n]*/g, '/**/')
        buffer.push(src)

        # add all mappings in this file
        map.eachMapping (mapping) ->
            mapping =
                generated:
                    line: mapping.generatedLine + lineOffset
                    column: mapping.generatedColumn
                original:
                    line: mapping.originalLine
                    column: mapping.originalColumn
                source: mapping.source,
                name: mapping.name
            generator.addMapping mapping

        map.sourcesContent.forEach (sourceContent, i) ->
            generator.setSourceContent(map.sources[i], sourceContent);

        # update line offset so we could start working with the next file
        lineOffset += src.split('\n').length

    if !maproot
        if isCSS
            buffer.push "/*# sourceMappingURL=#{path.relative(path.dirname(outFile), outMapFile)}*/"
        else 
            buffer.push "//# sourceMappingURL=#{path.relative(path.dirname(outFile), outMapFile)}"
    else
        if isCSS
            buffer.push "/*# sourceMappingURL=#{maproot + path.relative(path.dirname(outFile), outMapFile)}*/"
        else 
            buffer.push "//# sourceMappingURL=#{maproot + path.relative(path.dirname(outFile), outMapFile)}"


    outFile.split('/').reduce (prev, curr, i) ->
        if existsSync(prev) == false
            mkdirSync(prev)

        return prev + '/' + curr

    try
        writeFileSync(outFile, buffer.join('\n'), 'utf-8')
        writeFileSync(outMapFile, generator.toString(), 'utf-8')
    catch e
        console.log(e);
        console.error('Error writing bundle. Error: ' + e);