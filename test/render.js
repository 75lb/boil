var test = require("tape"),
    boil = require("../lib/boil");

test("render", function(t){
    var data = { one: 1, two: 2 };
    var template = "{{one}}{{two}}";
    var result = boil.render(template, data);

    t.equal(result, "12");
    t.end();
});

test("render with partials", function(t){
    var data = { one: 1, two: 2, three: 3, four: 4 };
    var template = "{{one}}{{two}}{{>three}}{{>four}}";
    var partials = [
        { name: "three", partial: "{{three}}"},
        { name: "four", partial: "{{four}}"}
    ];
    var result = boil.render(template, data, partials);

    t.equal(result, "1234");
    t.end();
});

test("render with helpers", function(t){
    var data = { one: 1, two: 2, three: 3 };
    var template = "{{one}}{{two}}{{three}}{{four}}";
    var helpers = [ 
        { name: "three", helper: function(){ return "three"; } },
        { name: "four", helper: function(){ return "four"; } }
    ];
    var result = boil.render(template, data, null, helpers);

    t.equal(result, "1234");
    t.end();
});
