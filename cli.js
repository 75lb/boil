#!/usr/bin/env node
"use strict";

var boil = require("./lib/boil");

var target = process.argv[2];

if (target){
    boil(target);
} else {
    console.log("Need a target");
}
