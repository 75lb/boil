"use strict";
var handlebars = require("handlebars"),
    w = require("wodge"),
    mfs = require("more-fs"),
    path = require("path"),
    FrontMatterExtractor = require("front-matter-extractor");

exports.boil = boil;
exports.render = render;

function render(template, data){
    return handlebars.compile(template)(data);
}

/** registers helpers and partials on the handlebars module */
function loadModules(helpers, partials){
    if (helpers){
        var helperFiles = new mfs.FileSet(helpers).files;
        helperFiles.forEach(function(helper){
            require(path.resolve(process.cwd(), helper))(handlebars);
        });
    }
    if (partials){
        var partialFiles = new mfs.FileSet(partials).files;
        partialFiles.forEach(function(partial){
            handlebars.registerPartial(
                path.basename(partial, ".hbs"),
                mfs.read(partial)
            );
        });
    }
}

function processFile(file, data){
    if (!file.dest) {
        console.error(file);
        throw new Error("target must specify a 'dest' path");
    }
    
    var content = "",
        mappingData = file.data || {};
    data = w.extend(data, mappingData);

    if (file.copy){
        var from = render(file.copy, data),
            to = render(file.dest, data);
        mfs.duplicate(from, to);
        console.log("Copied: " + from + " to " + to);
    } else {
        if (file.src){
            var extracted = new FrontMatterExtractor(mfs.read(file.src));
            content = extracted.content;
            data = w.extend(data, extracted.frontMatter);
        }
        var outputFile = render(file.dest, data),
            outputContent = render(content, data);
        mfs.write(outputFile, outputContent);
        console.log("Created: " + outputFile);
    }
}

/**
Execute boil command, using the supplied config and targetName
@param {object} config - the boil config
@param {string} recipe - specific recipe from the config
*/
function boil(config, recipeName){
    var recipe = recipeName ? config[recipeName] : config;
    if (!recipe) {
        console.error("Recipe not found in config: " + recipeName);
        return;
    }
    /* merge recipe-level data into the config-level data */
    var options = w.extend({}, config.options, recipe.options);

    loadModules(options.helpers, options.partials);

    /* replaces data.args, should it extend? */
    var data = w.extend(
        {},
        config.options && config.options.data,
        recipe.options && recipe.options.data
    );
    data.args = process.argv.slice(3);

    if (recipe.files){
        recipe.files.forEach(function(file){
            processFile(file, data);
        });
    } else {
        processFile(recipe, data);
    }
}