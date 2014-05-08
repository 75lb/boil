"use strict";
var handlebars = require("handlebars"),
    w = require("wodge"),
    mfs = require("more-fs"),
    path = require("path"),
    fme = require("front-matter-extractor");

require("handlebars-io")(handlebars);
fme.helper(handlebars);

exports.boil = boil;
exports.render = render;
exports.registerPartials = registerPartials;
exports.partials = handlebars.partials;
exports.registerHelpers = registerHelpers;
exports.helpers = handlebars.helpers;

function render(template, data){
    return handlebars.compile(template)(data);
}

function registerPartials(partials){
    if (typeof partials === "string"){
        var fileSet = new mfs.FileSet(partials);
        fileSet.files.forEach(function(file){
            handlebars.registerPartial(
                path.basename(file, ".hbs"),
                mfs.read(file)
            );
        });
    } else {
        w.arrayify(partials).forEach(function(partial){
            handlebars.registerPartial(partial.name, partial.template);
        });
    }
}

function registerHelpers(helpers){
    if (typeof helpers === "string"){
        var fileSet = new mfs.FileSet(helpers);
        fileSet.files.forEach(function(file){
            require(path.resolve(process.cwd(), file))(handlebars);
        });
    } else {
        w.arrayify(helpers).forEach(function(helper){
            handlebars.registerHelper(helper.name, helper.func);
        });
    }
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
            var extracted = fme.extract(mfs.read(file.src));
            content = extracted._remainder;
            data = w.extend(data, extracted);
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

/**
must work in browser.. i.e. it must return a string and do no IO.. cli should handle IO.
one template in, one result out. 
*/
function boil2(options){
    
}
