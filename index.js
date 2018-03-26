var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var createHasher = function () {
    var data = [];
    function get() {
        var block = Array.prototype.slice.apply(arguments);
        var blockLen = block.length;
        var isEqual = true;
        var item;
        for (var i = 0, iLen = data.length; i < iLen; i++) {
            item = data[i];
            if (item.length === blockLen) {
                isEqual = true;
                for (var j = 0; j < blockLen; j++) {
                    if (block[j] !== item[j]) {
                        isEqual = false;
                        break;
                    }
                }
                if (isEqual) {
                    return i;
                }
            }
        }
        var block = Array.prototype.slice.apply(arguments);
        data.push(block);
        return data.length - 1;
    }
    function clear() {
        data = [];
    }
    return { get: get, clear: clear };
}
module.exports.createHasher = createHasher;

module.exports.Fetcher = Fetcher;
function Fetcher(load) {
    this.load = load;
    this.hasher = createHasher();
    this.holder = [];
}

Fetcher.prototype.clear = function () {
    this.hasher.clear();
    this.holder = [];
};

Fetcher.prototype.get = function () {
    var index = this.hasher.get.apply(null, arguments);
    var ptr = this.holder[index] || (
        this.holder[index] = {
            hasData: false,
            data: undefined,
            error: undefined,
            defer: defer
        }
    );
    if (ptr.error !== undefined) {
        throw ptr.error;
    }
    if (ptr.defer === undefined) {
        var defer = this.load.apply(null, arguments);
        ptr.defer = defer;
        defer.then(
            function (data) {
                ptr.hasData = true;
                ptr.data = data;
                return data;
            },
            function (err) {
                return (ptr.error = err);
            }
        );
    }
    if (!ptr.hasData) {
        throw ptr.defer;
    }
    return ptr.data;
};

function wrapRender(render, renderLoader, renderError) {
    var catchDefer = null;
    var tLoader = typeof renderLoader;
    var tError = typeof renderError;
	return function() {
		try {
			return render.apply(this, arguments);
		} catch (e) {
			if (e instanceof Promise) {
				if (catchDefer !== e) {
                    catchDefer = e;
                    var ctx = this;
                    function forceUpdate() {
                        ctx.forceUpdate();
                    }
					e.then(forceUpdate, forceUpdate);
                }
                return (tLoader === 'string' && typeof this[renderLoader] === 'function') ?
                    this[renderLoader].call(this) :
                    tLoader === 'function' ? renderLoader.call(this) : null
			} else {
				return (tError === 'string' && typeof this[renderError] === 'function') ?
                    this[renderError].call(this, e) :
                    tError === 'function' ? renderError.call(this, e) : null
			}
		}
	};
}
module.exports.asyncClassFactory = asyncClassFactory;
function asyncClassFactory(opts) {
	return function asyncClass(Base) {
        var constructor = Base.constructor;
        __extends(WrapClass, Base);
        function WrapClass() {
            Base.apply(this, arguments);
            var ptrLoader = this.renderLoader;
            var ptrError = this.renderError;
            if (opts) {
                var renderLoader = opts.renderLoader;
                if (typeof renderLoader === 'function') {
                    ptrLoader = renderLoader;
                } else if (typeof renderLoader === 'string') {
                    ptrLoader = this[renderLoader];
                }
                var renderError = opts.renderError;
                if (typeof renderError === 'function') {
                    ptrError = renderError;
                } else if (typeof renderError === 'string') {
                    ptrError = this[renderError]
                }
            }
            if (this.renderLoader === undefined) {
                this.renderLoader = ptrLoader;
            } else {
                ptrLoader = this.renderLoader;
            }
            if (this.renderError === undefined) {
                this.renderError = ptrError;
            } else {
                ptrError = this.renderError;
            }
            this.render = wrapRender(this.render, ptrLoader, ptrError);
            return this;
        }
		return  WrapClass;
	}

}
module.exports.asyncClass = asyncClassFactory();

module.exports.asyncMethodFactory = asyncMethodFactory;
function asyncMethodFactory(opts) {
    return function(target, key, descriptor) {
        var fn = descriptor.value;
        if (typeof fn !== 'function') {
            throw new Error('decorator can only be applied to methods not: ' + typeof fn);
        }
        const wrapper = wrapRender(
            fn,
            (opts && opts.renderLoader) || 'renderLoader',
            (opts && opts.renderError) || 'renderError'
        );
        return {
            configurable: true,
            get: function() {
                if (this === target.prototype) {
                    return wrapper;
                }
                var boundFn = wrapper.bind(this);
                Object.defineProperty(this, key, {
                    value: boundFn,
                    configurable: true,
                    writable: true
                });
                return boundFn;
            }
        };
    }

}

module.exports.asyncMethod = asyncMethodFactory();

module.exports.createFetcher = createFetcher;
function createFetcher(fn) {
    return new Fetcher(fn);
}

