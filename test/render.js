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
    ]
    var result = boil.render(template, data, partials);

    t.equal(result, "1234");
    t.end();
});

test("render with helper", function(t){
    var data = { one: 1, two: 2, three: 3 };
    var template = "{{one}}{{two}}{{>partial}}";
    var partials = [{ name: "partial", partial: "{{three}}"}]
    var result = boil.render(template, data, partials);

    t.equal(result, "123");
    t.end();
});
