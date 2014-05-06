#!/usr/bin/env node
"use strict";

var boil = require("../lib/boil"),
    loadConfig = require("config-master"),
    path = require("path"),
    w = require("wodge"),
    Model = require("nature").Model;

var usage = "Usage: \nboil [options] <recipes>";

var argv = new Model()
    .define({ name: "help", alias: "h", type: "boolean" })
    .define({ name: "recipe", alias: "r", type: Array, defaultOption: true })
    .define({ name: "list", alias: "l", type: "boolean" })
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

if (argv.list){
    console.dir(config);
    process.exit(0);
}

if (argv.recipe) {
    argv.recipe.forEach(boil.boil.bind(null, config));
} else {
    boil.boil(config);
}


// precompile templates and watch for changes to source files in boil.json
// boil(template, data) - make reactive.. if template or data, or source data files change, then re-run boil
