var test = require("tape"),
    boil = require("../lib/boil");

test("register partials", function(t){
    boil.registerPartials("test/partials/*");
    
});