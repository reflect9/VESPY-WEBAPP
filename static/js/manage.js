

var Vespy = (function() {
	// Define private properties	
	DEFAULT_PLATE_DIMENSION = 3000
	DEFAULT_NODE_DIMENSION = 85
	NODE_MARGIN = 2
	DEFAULT_GRID_WIDTH = 600
	NODE_SIZE_LOW = 30
	NODE_SIZE_MID = 80
	NODE_SIZE_HIGH = 150
	TILE_TYPES = ['Trigger','Page','Element','Variable','Operation'];
	MAX_INFERENCE_STEPS = 3;
	MAX_CONTEXT_NODES = 20;
	MAX_INT = 9007199254740992;
	MIN_INT = -9007199254740992;

	// Define public properties and methods
	var init = function() {
		// INITIALIZING SYSTEM
	};
	var retrieveData = function() {
		// retrive data of the current application from server and update 
	};
	var create_enhancement = function(_title) {
		var enhancement = new pg.Enhancement({title:_title});
		pg.save_enhancement(enhancement);
		pg.browser.redraw(pg.enhancements);
	};
	var save_enhancement = function(_enh) {
		// Send current enhancement data to sever and save it
	};
	var remove_enhancement = function(_enh) {
		// 
	};
	var list_all_enhancements = function() {

	};



	// Return public stuff
	return {
		init: init,
		retrieveData: retrieveData
	}

})();




$(document).ready(function() {
	Vespy.init();
});




/*
// MODULE PATTERN
var MODULE = (function () {
	var pub = {},
		privateVariable = 1;

	var privateMethod = function() {
		// ...
	}

	pub.moduleProperty = 1;
	pub.moduleMethod = function () {
		// ...
	};

	return pub;
}());


// AUGMENTATION
var MODULE = (function (pub) {
	pub.anotherMethod = function () {
		// added method...
	};

	return pub;
}(MODULE || {}));


*/