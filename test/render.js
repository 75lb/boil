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
        { name: "three", template: "{{three}}"},
        { name: "four", template: "{{four}}"}
    ];

    boil.registerPartials(partials);
    var result = boil.render(template, data);

    t.equal(result, "1234");
    t.end();
});

test("render with helpers", function(t){
    var data = { one: 1, two: 2 };
    var template = "{{one}}{{two}}{{three a}}{{four a}}";
    var helpers = [ 
        { name: "three", func: function(){ return 3; } },
        { name: "four", func: function(){ return 4; } }
    ];
    
    boil.registerHelpers(helpers);
    var result = boil.render(template, data);

    t.equal(result, "1234");
    t.end();
});
