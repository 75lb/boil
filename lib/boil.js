"use strict";
var handlebars = require("handlebars"),
    w = require("wodge"),
    mfs = require("more-fs"),
    path = require("path"),
    fme = require("front-matter-extractor");

require("handlebars-io")(handlebars);

// require("jsdoc-to-markdown")(handlebars);
// require("handlebars-array")(handlebars);
// fme.helper(handlebars);

exports.partials = handlebars.partials;
exports.helpers = handlebars.helpers;
exports.registerPartial = handlebars.registerPartial;
exports.registerHelper = handlebars.registerHelper;
exports.registerPartials = registerPartials;
exports.registerHelpers = registerHelpers;
exports.render = render;

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
