#!/usr/bin/env node
"use strict";

var boil = require("../lib/boil"),
    loadConfig = require("load-config"),
    path = require("path"),
    w = require("wodge");

var target = process.argv[2];

var config = loadConfig(
    path.join(w.getHomeDir(), ".boil.json"),
    path.join(process.cwd(), "boil.json"),
    path.join(process.cwd(), "package.json:boil")
);
boil.boil(config, target);
