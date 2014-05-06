var test = require("tape"),
    boil = require("../lib/boil");

test("register partial files", function(t){
    boil.registerPartials("test/partials/*");
    t.equals(boil.partials.one, "1");
    t.equals(boil.partials.two, "2");
    t.end();
});

test("register partial object", function(t){
    delete boil.partials.one; 
    delete boil.partials.two; 
    boil.registerPartials({ name: "one", template: "1" });
    t.equals(boil.partials.one, "1");
    t.equals(boil.partials.two, undefined);
    t.end();
});

test("register array of partial objects", function(t){
    delete boil.partials.one; 
    delete boil.partials.two; 
    boil.registerPartials([
        { name: "one", template: "1" },
        { name: "two", template: "2" }
    ]);
    t.equals(boil.partials.one, "1");
    t.equals(boil.partials.two, "2");
    t.end();
});
