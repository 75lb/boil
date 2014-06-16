"use strict";
var handlebars = require("handlebars"),
    o = require("object-tools"),
    a = require("array-tools"),
    mfs = require("more-fs"),
    FileSet = require("file-set"),
    path = require("path"),
    fme = require("front-matter-extractor");

require("handlebars-io")(handlebars);
require("handlebars-array")(handlebars);
require("handlebars-fs")(handlebars);
require("handlebars-fileset")(handlebars);
require("handlebars-string")(handlebars);
require("handlebars-path")(handlebars);
require("handlebars-comparison")(handlebars);
require("handlebars-ansi")(handlebars);
require("front-matter-extractor").helper(handlebars);

exports.partials = handlebars.partials;
exports.helpers = handlebars.helpers;
exports.registerPartial = handlebars.registerPartial;
exports.registerPartials = registerPartials;
exports.registerHelper = handlebars.registerHelper;
exports.registerHelpers = registerHelpers;
exports.render = render;
exports.renderRecipe = renderRecipe;
exports.setArgs = setArgs;
exports.compile = compile;

handlebars.logger.level = 1;

function render(template, data){
    return handlebars.compile(template)(data);
}

function compile(template){
    return handlebars.compile(template);
}

function registerPartials(partials){
    if (typeof partials === "string"){
        var fileSet = new FileSet(partials);
        fileSet.files.forEach(function(file){
            handlebars.registerPartial(
                path.basename(file, ".hbs"),
                mfs.read(file)
            );
        });
    } else {
        a.arrayify(partials).forEach(function(partial){
            handlebars.registerPartial(partial.name, partial.template);
        });
    }
}

function registerHelpers(helpers){
    if (typeof helpers === "string"){
        var fileSet = new FileSet(helpers);
        fileSet.files.forEach(function(file){
            require(path.resolve(process.cwd(), file))(handlebars);
        });
    } else {
        a.arrayify(helpers).forEach(function(helper){
            handlebars.registerHelper(helper.name, helper.func);
        });
    }
}

function renderRecipe(config, recipeName){
    var recipe = config[recipeName];
    if (!recipe) {
        console.error("Recipe not in config: " + recipeName);
        return;
    }
    if (Array.isArray(recipe)){
        var recipes = recipe;
        recipes.forEach(renderRecipe.bind(null, config));
    } else {
        var mergedOptions = o.extend(config.options, recipe.options);
        registerPartials(mergedOptions.partials);
        registerHelpers(mergedOptions.helpers);

        var data = o.extend(config.options && config.options.data, recipe.data);
        var result = render(recipe.template, data);
        
        if (recipe.dest){
            recipe.dest = render(recipe.dest, data);
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
