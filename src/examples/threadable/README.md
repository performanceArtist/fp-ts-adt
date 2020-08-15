# Threadable

An abstraction that generalizes passing the dependencies through Reader with dependencies taken as an object and a monadic result. Could be used similarly to the do notation, but is more suited for the dependency injection model, with dependencies taken and returned as object properties.

* `thread` - provides the arguments and adds them to the result object.

* `threadPartial` - partially applies the dependencies - returns a function, which will add provided properties to the result.

* `inject` - same as `threadPartial`, but doesn't add the dependecies to result, simply returns a "partial" function.
