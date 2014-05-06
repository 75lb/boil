var test = require("tape"),
    boil = require("../lib/boil");

test("register helper files", function(t){
    boil.registerHelpers("test/helpers/*");
    t.ok(boil.helpers.one);
    t.ok(boil.helpers.two);
    t.end();
});

test("register helper object", function(t){
    delete boil.helpers.one; 
    delete boil.helpers.two; 
    var one = function(){ return 1; };
    boil.registerHelpers({ name: "one", func: one });
    t.equal(boil.helpers.one, one);
    console.log(boil.helpers.one.toString());
    t.end();
});

test("register array of helper objects", function(t){
    delete boil.helpers.one; 
    delete boil.helpers.two; 
    var one = function(){ return 1; };
    var two = function(){ return 2; };
    boil.registerHelpers([
        { name: "one", func: one },
        { name: "two", func: two }
    ]);
    t.equal(boil.helpers.one, one);
    t.equal(boil.helpers.two, two);
    t.end();
});
