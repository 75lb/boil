#!/usr/bin/env node
"use strict";

var boil = require("../lib/boil"),
    loadConfig = require("config-master"),
    path = require("path"),
    w = require("wodge"),
    Model = require("nature").Model;

var usage = "Usage: \nboil <recipes>";

var argv = new Model()
    .define({ name: "help", alias: "h", type: "boolean" })
    .define({ name: "recipe", alias: "r", type: Array, defaultOption: true })
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

if (argv.recipe) {
    argv.recipe.forEach(boil.boil.bind(null, config));
} else {
    boil.boil(config);
}