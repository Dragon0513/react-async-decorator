var Holder = require('./holder').Holder;

function Fetcher(opts) {
    this.load = opts.load;
    this.holder = new Holder(opts);
}

Fetcher.prototype.clear = function () {
    return this.holder.clear();
};

Fetcher.prototype.awaitAll = function() {
    return this.holder.awaitAll();
}

Fetcher.prototype.await = function() {
    var args = Array.prototype.slice.apply(arguments);
    var key = args.length ? JSON.stringify(args) : '';
    return this.holder.await(key);
}

Fetcher.prototype.asyncGet = function() {
    var args = Array.prototype.slice.apply(arguments);
    var key = args.length ? JSON.stringify(args) : '';
    this.init(key, args);
    return this.holder.await(key);
}

Fetcher.prototype.init = function(key, args) {
    if (!this.holder.has(key)) {
        var defer = this.load.apply(null, args);
        this.holder.set(key, defer);
    }
}

Fetcher.prototype.get = function () {
    var args = Array.prototype.slice.apply(arguments);
    var key = args.length ? JSON.stringify(args) : '';
    this.init(key, args);
    var error = this.holder.error(key);
    if (error !== undefined) {
        throw error;
    }
    if (!this.holder.has(key)) {
        throw this.holder.await(key);
    }
    return this.holder.get(key);
};

function create(accessor) {
    var counter = 0;
    function createFetcher(load, name) {
        var pname = (name === undefined || name === null) ? ('' + counter++) : name;
        return new Fetcher({ load: load, name: pname, accessor: accessor });
    }
    return createFetcher;
}

module.exports.Fetcher = Fetcher;
module.exports.create = create;
