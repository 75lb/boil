#!/usr/bin/env node
"use strict";

var boil = require("../"),
    loadConfig = require("config-master"),
    path = require("path"),
    mfs = require("more-fs"),
    fs = require("fs"),
    cliArgs = require("command-line-args"),
    getHomeDir = require("home-path");

/* Parse and validate user input  */
var usage = "Usage: \nboil [options] <recipes>";
var argv = cliArgs([
    { name: "help", alias: "h", type: Boolean },
    { name: "recipe", alias: "r", type: Array, defaultOption: true },
    { name: "config", alias: "c", type: Boolean },
    { name: "list", alias: "l", type: Boolean },
    { name: "helper", alias: "f", type: Array },
    { name: "partial", alias: "p", type: Array },
    { name: "template", alias: "t", type: String },
    { name: "data", alias: "d", type: String },
    { name: "args", alias: "a", type: Array }
]).parse();

if (argv.help) {
    console.log(usage);
    process.exit(0);
}

function getConfig(){
    /* load boil config data */
    var config = loadConfig(
        path.join(getHomeDir(), ".boil.json"),
        path.join(process.cwd(), "boil.json"),
        path.join(process.cwd(), "package.json:boil")
    );

    if (Object.keys(config).length === 0){
        console.error("No config");
        process.exit(1);
    }

    return config;
}

if (argv.config){
    console.dir(getConfig());
    process.exit(0);
}
if (argv.list){
    console.log(Object.keys(getConfig()));
    process.exit(0);
}

if (argv.helper) argv.helper.forEach(boil.registerHelpers);
if (argv.partial) argv.partial.forEach(boil.registerPartials);

if (argv.recipe && argv.recipe.length) {
    var config = getConfig();
    config = boil.setArgs(config, argv.args)
    argv.recipe.forEach(boil.renderRecipe.bind(null, config));

} else if (argv.template) {
    var data = argv.data
        ? JSON.parse(mfs.read(argv.data))
        : {};
    console.log(boil.render(mfs.read(argv.template), data));

} else {
    console.log(usage);
}

/*
- rendering from cli (--template --data)
- management of presets (boil.json boil --recipe)
_ helpers (handrake-array, io, fs, string, fme)

TODO

- read arbitrary JSON from stdin ()
- take template data from argv (e.g. boil recipe arg1 arg2)
- write to artibraty streams, e.g. http
*/
