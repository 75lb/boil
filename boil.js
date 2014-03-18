"use strict";
var handlebars = require("handlebars"),
    glob = require("glob"),
    w = require("wodge"),
    fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp"),
    FrontMatterExtractor = require("front-matter-extractor"),
    config = require("./config.json"),
    l = console.log;

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

var target = process.argv[2];

function boil(){
    /* get options from from config.target.options */
    var options = w.extend({ data: {} }, config[target].options);

    // /* merge in data from config.target */
    // var mappingData = config[target].data || {},
    //     data = w.extend(options.data, mappingData);

    var data = options.data;
    data.args = process.argv.slice(2);
    loadModules(options.helpers, options.partials);
    
    config[target].files.forEach(function(file){
        var content = "",
            mappingData = file.data || {};
        data = w.extend(data, mappingData);

        if (file.copy){
            copy(
                render(file.copy, data), 
                render(file.dest, data)
            );
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
    });
}

boil();
