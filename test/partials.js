var test = require("tape"),
    boil = require("../lib/boil");

test("register partial files", function(t){
    boil.registerPartials("test/partials/*");
    t.equals(boil.partials.one, "1");
    t.equals(boil.partials.two, "2");
    t.end();
});

test("register partial object", function(t){
    boil.registerPartials({ name: "one", partial: "1" });
    t.equals(boil.partials.one, "1");
    t.end();
});

test("register array of partial objects", function(t){
    boil.registerPartials([
        { name: "one", partial: "1" },
        { name: "two", partial: "2" }
    ]);
    t.equals(boil.partials.one, "1");
    t.equals(boil.partials.two, "2");
    t.end();
});
