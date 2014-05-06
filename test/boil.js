var test = require("tape"),
    boil = require("../lib/boil");

test("render", function(t){
    var data = { "one": 1, "two": 2 };
    var template = "{{one}}{{two}}";
    var result = boil.render(template, data);

    t.equal(result, "12");    
    t.end();
});
