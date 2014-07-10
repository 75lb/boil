#!/usr/bin/env node
"use strict";

var boil = require("../"),
    loadConfig = require("config-master"),
    dope = require("console-dope"),
    path = require("path"),
    mfs = require("more-fs"),
    fs = require("fs"),
    cliArgs = require("command-line-args"),
    getHomeDir = require("home-path");

/* Parse and validate user input  */
var cli = cliArgs([
    { name: "help", alias: "h", type: Boolean },
    { name: "recipe", alias: "r", type: Array, defaultOption: true },
    { name: "config", alias: "c", type: Boolean },
    { name: "list", alias: "l", type: Boolean },
    { name: "helper", alias: "f", type: Array },
    { name: "partial", alias: "p", type: Array },
    { name: "template", alias: "t", type: String },
    { name: "data", alias: "d", type: String },
    { name: "args", alias: "a", type: Array }
]);

var usage = cli.getUsage({
    title: "boil-js",
    header: "Content generator",
    forms: [ "$ boil [options] <recipes>" ]
});

try{
    var argv = cli.parse();
} catch(err){
    halt(err);
}

if (argv.help) {
    console.log(usage);
    process.exit(0);
}

function getConfig(){
    /* load boil config data */
    var config = loadConfig(
        path.join(getHomeDir(), ".boil.json"),
        path.join(process.cwd(), "boil.json"),
        { jsonPath: path.join(process.cwd(), "package.json"), configProperty: "boil" }
    );
    
    var boilDir = path.join(getHomeDir(), ".boil");
    var recipeFiles = fs.readdirSync(boilDir);
    recipeFiles.forEach(function(file){
        var template = fs.readFileSync(path.join(boilDir, file), "utf8");
        config[path.basename(file, ".hbs")] = {
            template: template
        };
    });

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

function halt(err){
    dope.red.error(err.stack);
    dope.error(usage);
    process.exit(1);
}
