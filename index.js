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

module.exports.Fetcher = Fetcher;
function Fetcher(load) {
    this.load = load;
    this.hasData = false;
    this.data = undefined;
    this.error = undefined;
    this.defer = undefined;
}

Fetcher.prototype.clear = function () {
    this.hasData = false;
    this.data = undefined;
    this.defer = undefined;
    this.error = undefined;
};
Fetcher.prototype.has = function (defer) {
    return this.defer === defer;
};
Fetcher.prototype.set = function (defer) {
    var _this = this;
    if (this.defer !== defer) {
        this.clear();
        this.defer = defer;
        defer.then(function (data) {
            _this.hasData = true;
            _this.data = data;
            return data;
        }, function (err) { return (_this.error = err); });
    }
};
Fetcher.prototype.get = function () {
    if (this.error !== undefined) {
        throw this.error;
    }
    if (!this.defer) {
        this.set(this.load());
    }
    if (!this.hasData) {
        throw this.defer;
    }
    return this.data;
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
                    ptrLoader = this.renderLoader = renderLoader;
                } else if (typeof renderLoader === 'string') {
                    ptrLoader = this[renderLoader];
                }
                var renderError = opts.renderError;
                if (typeof renderError === 'function') {
                    ptrError = this.renderError = renderError;
                } else if (typeof renderError === 'string') {
                    ptrError = this[renderError]
                }
            }
            this.render = wrapRender(this.render, ptrLoader, ptrError);
            if (this.renderLoader === undefined) {
                this.renderLoader = function () {
                    return (opts && opts.renderLoader) ? opts.renderLoader() : null;
                };
            }
            if (this.renderError === undefined) {
                this.renderError = function (err) {
                    return (opts && opts.renderError) ? opts.renderError(err) : null;
                };
            }
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

