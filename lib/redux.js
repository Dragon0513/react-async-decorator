var create = require('./fetcher').create;
function createReduxFetcher(ACTION, KEY) {
    var api;

    function use(aApi) {
        api = aApi;
        return function(next) {
            return function(action) {
                return next(action);
            }
        };
    }

    function getApi() {
        if (!api) {
            throw new Error('add middleware to redux');
        }
        return api;
    }

    function createAccessor(name) {
        function clear() {
            getApi().dispatch({ type: ACTION, action: 'clear', name: name });
        }
        function get(key) {
            var state = getApi().getState();
            var data = state[KEY];
            var ptr = data ? data[key] : undefined;
            return (ptr && ptr[key]) ? ptr[key].d : undefined;
        }
        function set(key, val) {
            getApi().dispatch({ type: ACTION, action: 'set', key: key, value: val, name: name });
        }
        function has(key) {
            var state = getApi().getState()[KEY];
            var data = state[name];
            var ptr = data ? data[key] : undefined;
            return !!ptr;
        }
        return { clear: clear, set: set, has: has, get: get };
    }

    function reducer(state, action) {
        if (action.type === ACTION) {
            var nstate = Object.assign({}, state);
            if (action.action === 'clear') {
                if (nstate[KEY]) {
                    nstate[KEY][action.name] = {};
                }
            } else if (action.action === 'set') {
                var key = action.key;
                var name = action.name;
                var data = nstate[KEY] = Object.assign({}, nstate[KEY]);
                var ptr = data[name] = Object.assign({}, data[name]);
                ptr[key] = { d: action.value };
            }
            return nstate;
        }
        return state;
    }

    var createFetcher = create(createAccessor);
    return { use: use, reducer: reducer, createFetcher: createFetcher };
}

module.exports.createReduxFetcher = createReduxFetcher;
