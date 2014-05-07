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
    .define({ name: "list", alias: "l", type: "boolean" })
    .define({ name: "template", alias: "t", type: "string" })
    .define({ name: "data", alias: "d", type: "string" })
    .set(process.argv);

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

if (argv.list){
    console.dir(config);
    process.exit(0);

} else if (argv.recipe) {
    argv.recipe.forEach(function(recipe){
        var recipeConfig = config[recipe];
        recipeConfig.options = w.extend(options, recipeConfig.options);
        boil.registerPartials(recipeConfig.options.partials);
        boil.registerHelpers(recipeConfig.options.helpers);
        console.log(boil.render(recipeConfig.template, recipeConfig.data));
    });

} else if (argv.template) {
    console.log(boil.render(mfs.read(argv.template), mfs.read(argv.data)));
    
} else {
    console.log(usage);
}


// precompile templates and watch for changes to source files in boil.json
// boil(template, data) - make reactive.. if template or data, or source data files change, then re-run boil
