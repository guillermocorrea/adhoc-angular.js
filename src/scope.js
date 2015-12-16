'use strict';
function Scope() {
	this.$$watchers = [];
}

Scope.prototype.$watch = function (watchFn, listenerFn, valueEq) {
	var watcher = {
		watchFn: watchFn,
		listenerFn: listenerFn || function () { },
		valueEq: !!valueEq
	};
	this.$$watchers.push(watcher);
};

Scope.prototype.$$areEqual = function (newValue, oldValue, valueEq) {
	if (valueEq) {
		return _.isEqual(newValue, oldValue);
	} else {
		return newValue === oldValue ||
			(typeof newValue === 'number' && typeof oldValue === 'number' &&
				isNaN(newValue) && isNaN(oldValue));
	}
};

Scope.prototype.$eval = function (expr, locals) {
	return expr(this, locals);
};

Scope.prototype.$$digestOnce = function () {
	var self = this;
	var dirty;
	_.forEach(this.$$watchers, function (watch) {
		var newValue = watch.watchFn(self);
		var oldValue = watch.last;
		if (!self.$$areEqual(newValue, oldValue, watch.valueEq)) {
			watch.listenerFn(newValue, oldValue, self);
			watch.last = (watch.valueEq ? _.cloneDeep(newValue) : newValue);
			dirty = true;
		}
	});
	return dirty;
};

Scope.prototype.$digest = function () {
	// time to live
	var ttl = 10;
	var dirty;
	do {
		dirty = this.$$digestOnce();
		if (dirty && !(ttl--)) {
			throw "10 digest iterations reached";
		}
	} while (dirty);
};

Scope.prototype.$apply = function (expr) {
	try {
		return this.$eval(expr);
	} finally {
		this.$digest();
	}
};

var scope = new Scope();
/*scope.firstName = 'Joe';
scope.counter = 0;
scope.$watch(
	function (scope) {
		return scope.firstName;
	},
	function (newValue, oldValue, scope) {
		scope.counter++;
	}
	);

console.log(scope.counter === 0);

scope.$digest();
console.log(scope.counter === 1);

// Further digests don't call the listener...
scope.$digest();
scope.$digest();
console.log(scope.counter === 1);

// ... until the value that the watch function is watching changes again
scope.firstName = 'Jane';
scope.$digest();
console.log(scope.counter === 2);

scope.$digest();
scope.$digest();*/

scope.$watch(function () {
	console.log('digest listener fired');
});

scope.$digest();
scope.$digest();
scope.$digest();