var test = require("tape"),
    boil = require("../lib/boil");

test("compile", function(t){
    var data = { one: 1, two: 2 };
    var template = "{{one}}{{two}}";
    var func = boil.compile(template, data);

    t.equal(func(data), "12");
    t.end();
});

test("compile with partials", function(t){
    var data = { one: 1, two: 2, three: 3, four: 4 };
    var template = "{{one}}{{two}}{{>three}}{{>four}}";
    var partials = [
        { name: "three", partial: "{{three}}"},
        { name: "four", partial: "{{four}}"}
    ]
    var func = boil.compile(template, data, partials);

    t.equal(func(data), "1234");
    t.end();
});

test("compile with helper", function(t){
    var data = { one: 1, two: 2, three: 3 };
    var template = "{{one}}{{two}}{{>partial}}";
    var partials = [{ name: "partial", partial: "{{three}}"}]
    var func = boil.compile(template, data, partials);

    t.equal(func(data), "123");
    t.end();
});
