#!/usr/bin/env node
"use strict";

var boil = require("./lib/boil"),
    config = require("./config.json");

var target = process.argv[2];

if (target){
    boil(config, target);
} else {
    console.log("Need a target");
}
