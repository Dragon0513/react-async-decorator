var createAccessor = require('./accessor').createAccessor;

function Holder(opts) {
    this.accessor = opts.accessor ? opts.accessor(opts.name) : createAccessor();
    this.container = {};
}

Holder.prototype.clear = function() {
    this.accessor.clear();
    this.container = {};
}


Holder.prototype.get = function(key) {
    return this.accessor.get(key);
}

Holder.prototype.has = function(key) {
    return this.accessor.has(key);
}

Holder.prototype.error = function(key) {
    var ptr = this.container[key];
    return ptr ? ptr.error : undefined;
}

Holder.prototype.awaits = function (key) {
  return !!this.container[key];
}

Holder.prototype.set = function(key, defer) {
    if (!defer || !defer.then) {
        defer = Promise.resolve(defer);
    }
    var ptr = {
        error: undefined,
        defer: defer
    };
    this.container[key] = ptr;
    var t = this;
    defer.then(function(data) {
        t.accessor.set(key, data);
    }, function(err) {
        t.accessor.set(key, undefined);
        ptr.error = err;
    });
}

Holder.prototype.await = function (key) {
    var ptr = this.container[key];
    if (ptr && ptr.defer) {
        return ptr.defer;
    }
    return Promise.reject('Bucket with key:' + key + ' doesn\' exist');
}

Holder.prototype.awaitAll = function() {
    var t = this;
    const defers = Object.keys(this.container).map(function(key) {
        return t.await(key);
    });
    return Promise.all(defers);
}

module.exports.Holder = Holder;
