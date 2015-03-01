"use strict";
var handlebars = require("handlebars");
var o = require("object-tools");
var a = require("array-tools");
var mfs = require("more-fs");
var FileSet = require("file-set");
var path = require("path");
var renderStream = require("./renderStream");

handlebars.registerHelper(require("handlebars-ansi"));
handlebars.registerHelper(require("handlebars-array"));
handlebars.registerHelper(require("handlebars-comparison"));
handlebars.registerHelper(require("handlebars-fileset"));
handlebars.registerHelper(require("handlebars-fs"));
handlebars.registerHelper(require("handlebars-json"));
handlebars.registerHelper(require("handlebars-path"));
handlebars.registerHelper(require("handlebars-regexp"));
handlebars.registerHelper(require("handlebars-string"));
handlebars.registerHelper(require("front-matter-extractor").helper);

exports._handlebars = handlebars;
exports.registerPartials = registerPartials;
exports.registerHelpers = registerHelpers;
exports.render = render;
exports.compile = compile;
exports.renderStream = renderStream;
exports.renderRecipe = renderRecipe;

handlebars.logger.level = 1;

function render(template, data){
    return compile(template)(data);
}

function compile(template){
    return handlebars.compile(template);
    if (!template) throw new Error("[boil.compile] template is empty: " + JSON.stringify(template));
}

/* should be compatible with handlebars.registerPartial */
function registerPartials(paths){
    var fileSet = new FileSet(paths);
    fileSet.files.forEach(function(file){
        handlebars.registerPartial(
            path.basename(file, ".hbs"),
            mfs.read(file)
        );
    });
}

/* should be compatible with handlebars.registerHelper */
function registerHelpers(helpers){
    var fileSet = new FileSet(helpers);
    fileSet.files.forEach(function(file){
        handlebars.registerHelper(require(path.resolve(process.cwd(), file)));
    });
}

function renderRecipe(config, args, recipeName){
    config = setArgs(config, args);
    var recipe = config[recipeName];
    if (!recipe) {
        console.error("Recipe not in config: " + recipeName);
        return;
    }
    if (Array.isArray(recipe)){
        var recipes = recipe;
        recipes.forEach(renderRecipe.bind(null, config, args));
    } else {
        var mergedOptions = o.extend(config.options, recipe.options);
        registerPartials(mergedOptions.partials);
        registerHelpers(mergedOptions.helpers);

        var data = o.extend(config.options && config.options.data, recipe.data);
        var result = render(recipe.template, data);

        if (recipe.dest){
            recipe.dest = render(recipe.dest, data);
            /* mfs.write will create the directory if it doesn't exist */
            mfs.write(recipe.dest, result);
            console.log("%s bytes written to %s", result.length, recipe.dest);
        } else {
            process.stdout.write(result);
        }
    }
}

function setArgs(config, args){
	if (!config.options) config.options = {};
	if (!config.options.data) config.options.data = {};
	config.options.data.args = args;
    return config;
}
