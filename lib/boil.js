"use strict";
var handlebars = require("handlebars"),
    glob = require("glob"),
    w = require("wodge"),
    fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp"),
    FrontMatterExtractor = require("front-matter-extractor");

module.exports = boil;

function render(template, data){
    return handlebars.compile(template)(data);
}

function copy(from, to){
    fs.createReadStream(from).pipe(fs.createWriteStream(to));
}
function read(from){
    return fs.readFileSync(from, { encoding: "utf8" });
}
function write(to, content){
    mkdirp.sync(path.dirname(to));
    fs.writeFileSync(to, content);
}

function loadModules(helpers, partials){
    if (helpers){
        glob.sync(helpers).forEach(function(helper){
            require(path.resolve(process.cwd(), helper))(handlebars);
        });
    }
    if (partials){
        glob.sync(partials).forEach(function(partial){
            handlebars.registerPartial(
                path.basename(partial, ".hbs"),
                read(partial)
            );
        });
    }
}

function processFile(file, data){
    var content = "",
        mappingData = file.data || {};
    data = w.extend(data, mappingData);

    if (file.copy){
        var from = render(file.copy, data),
            to = render(file.dest, data);
        copy(from, to);
        console.log("Copied: " + from + " to " + to);
    } else {
        if (file.src){
            var extracted = new FrontMatterExtractor(read(file.src));
            content = extracted.content;
            data = w.extend(data, extracted.frontMatter);
        }
        var outputFile = render(file.dest, data),
            outputContent = render(content, data);
        write(outputFile, outputContent);
        console.log("Created: " + outputFile);
    }
}

function boil(config, targetName){
    var target = config[targetName];
    if (!target) {
        console.error("Target not found in config: " + targetName);
        return;
    }
    
    /* merge target-level data into the config-level data */
    var options = w.extend({}, config.options, target.options);

    loadModules(options.helpers, options.partials);

    /* replaces data.args, should it extend? */
    var data = w.extend(
        {},
        config.options && config.options.data,
        target.options && target.options.data
    );
    data.args = process.argv.slice(3);

    if (target.files){
        target.files.forEach(function(file){
            processFile(file, data);
        });
    } else {
        processFile(target, data);
    }
}

boil.expand = glob.sync;
