#!/usr/bin/env node
"use strict";

var boil = require("../lib/boil"),
    loadConfig = require("config-master"),
    path = require("path"),
    w = require("wodge"),
    mfs = require("more-fs"),
    Model = require("nature").Model;

var usage = "Usage: \nboil [options] <recipes>";

var argv = new Model()
    .define({ name: "help", alias: "h", type: "boolean" })
    .define({ name: "recipe", alias: "r", type: Array, defaultOption: true })
    .define({ name: "config", type: "boolean" })
    .define({ name: "helper", type: Array })
    .define({ name: "template", alias: "t", type: "string" })
    .define({ name: "data", alias: "d", type: "string" })
    .set(process.argv);

// console.dir(argv.toJSON());return;
if (argv.help) {
    console.log(usage);
    process.exit(0);
}

var config = loadConfig(
    path.join(w.getHomeDir(), ".boil.json"),
    path.join(process.cwd(), "boil.json"),
    path.join(process.cwd(), "package.json:boil")
);

var options = config.options || {};

if (argv.helper){
    argv.helper.forEach(boil.registerHelpers);
}

if (argv.config){
    console.dir(config);
    process.exit(0);

} else if (argv.recipe && argv.recipe.length) {
    argv.recipe.forEach(renderRecipe);

} else if (argv.template) {
    var data = argv.data
        ? JSON.parse(mfs.read(argv.data))
        : {};
    console.log(boil.render(mfs.read(argv.template), data));

} else {
    console.log(usage);
}

function renderRecipe(recipeName){
    var recipe = config[recipeName];
    if (Array.isArray(recipe)){
        var recipes = recipe;
        recipes.forEach(renderRecipe);
    } else {
        var mergedOptions = w.extend(options, recipe.options);
        boil.registerPartials(mergedOptions.partials);
        boil.registerHelpers(mergedOptions.helpers);

        var result = boil.boil(config, recipeName);
        if (recipe.dest){
            mfs.write(recipe.dest, result)
            console.log("%s bytes written to %s", result.length, recipe.dest);
        } else {
            console.log(result);
        }
    }
}

// precompile templates and watch for changes to source files in boil.json
// boil(template, data) - make reactive.. if template or data, or source data files change, then re-run boil
/*
handbrake puts data in a template, cli compiles templates to JS.

boil adds

- rendering from cli (--template --data)
- a 'reactive data' layer.. the output is re-rendered if either template or data inputs change
- a means to store presets for boilerplating pages, components, src files etc.

*/
