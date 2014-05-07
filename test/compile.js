var test = require("tape"),
    boil = require("../lib/boil");

// test("compile", function(t){
//     var template = "{{one}}{{two}}";
//     var data = { one: 1, two: 2 };
//     var compiledTemplate = boil.compile(template);
// 
//     t.equal(compiledTemplate(data), "12");
//     t.end();
// });
// 
// test("compile with partials", function(t){
//     var template = "{{one}}{{two}}{{>three}}{{>four}}";
//     var data = { one: 1, two: 2, three: 3, four: 4 };
//     var partials = [
//         { name: "three", partial: "{{three}}"},
//         { name: "four", partial: "{{four}}"}
//     ];
//     
//     boil.registerPartials(partials);
//     var compiledTemplate = boil.compile(template);
// 
//     t.equal(compiledTemplate(data), "1234");
//     t.end();
// });
// 
// test("compile with helpers", function(t){
//     var data = { one: 1, two: 2 };
//     var template = "{{one}}{{two}}{{three}}{{four}}";
//     var helpers = [ 
//         { name: "three", helper: function(){ return 3; } },
//         { name: "four", helper: function(){ return 4; } }
//     ];
//     
//     boil.registerHelpers(helpers);
//     var result = boil.render(template, data);
// 
//     t.equal(result, "1234");
//     t.end();
// });
