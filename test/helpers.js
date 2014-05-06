var test = require("tape"),
    boil = require("../lib/boil");

test("register helper files", function(t){
    boil.registerPartials("test/helpers/*");
    t.ok(boil.helpers.one);
    t.ok(boil.helpers.two);
    t.end();
});

test("register helper object", function(t){
    boil.registerHelpers({ name: "one", helper: function(){ return 1;} });
    t.ok(boil.helpers.one);
    t.end();
});

test("register array of helper objects", function(t){
    boil.registerHelpers([
        { name: "one", helper: function(){ return 1;} },
        { name: "two", helper: function(){ return 2;} }
    ]);
    t.ok(boil.helpers.one);
    t.ok(boil.helpers.two);
    t.end();
});
