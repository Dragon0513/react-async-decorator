function createAccessor() {
    var container = {};
    function clear() {
        container = {};
    }
    function set(key, val) {
        container[key] = val;
    }
    function has(key) {
        return container.hasOwnProperty(key);
    }
    function get(key) {
        return container[key];
    }
    return { clear, set, has, get };
}

module.exports.createAccessor = createAccessor;
