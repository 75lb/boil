"use strict";
var handlebars = require("handlebars"),
    w = require("wodge"),
    mfs = require("more-fs"),
    path = require("path"),
    fme = require("front-matter-extractor"),
    handlebarsIO = require("handlebars-io"),
    handlebarsArray = require("handlebars-array"),
    handlebarsFs = require("handlebars-fs"),
    handlebarsFileset = require("handlebars-fileset"),
    handlebarsString = require("handlebars-string"),
    handlebarsPath = require("handlebars-path");

/*  no IO inside this module, browser too.  */

/* built-in helpers/partials */
handlebarsIO(handlebars);
handlebarsArray(handlebars);
handlebarsPath(handlebars);
handlebarsFs(handlebars);
handlebarsFileset(handlebars);
handlebarsString(handlebars);
fme.helper(handlebars);

exports.partials = handlebars.partials;
exports.helpers = handlebars.helpers;
exports.registerPartial = handlebars.registerPartial;
exports.registerPartials = registerPartials;
exports.registerHelper = handlebars.registerHelper;
exports.registerHelpers = registerHelpers;
exports.render = render;
exports.renderRecipe = renderRecipe;

handlebars.logger.level = 1;

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
        var mergedOptions = w.extend(config.options, recipe.options);
        registerPartials(mergedOptions.partials);
        registerHelpers(mergedOptions.helpers);

        var data = w.extend(config.options && config.options.data, recipe.data);
        var result = render(recipe.template, data);
        
        if (recipe.dest){
            mfs.write(recipe.dest, result);
            console.log("%s bytes written to %s", result.length, recipe.dest);
        } else {
            console.log(result);
        }
    }
}
