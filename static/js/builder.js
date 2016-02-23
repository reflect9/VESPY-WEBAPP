// Constructor for App Class
Vespy.Builder = function(data) {
	this.DEFAULT_PLATE_DIMENSION = 3000
	this.DEFAULT_NODE_DIMENSION = 85
	this.NODE_MARGIN = 2
	this.DEFAULT_GRID_WIDTH = 600
	this.NODE_SIZE_LOW = 30
	this.NODE_SIZE_MID = 80
	this.NODE_SIZE_HIGH = 150
	this.TILE_TYPES = ['Trigger','Page','Element','Variable','Operation'];
	this.MAX_INFERENCE_STEPS = 3;
	this.MAX_CONTEXT_NODES = 20;
	this.MAX_INT = 9007199254740992;
	this.MIN_INT = -9007199254740992;

	this._initialData = {};
	for (var attrname in data) { this._initialData[attrname] = data[attrname]; }
	this.title = data.title;
	this.pages = [];
	this.datatables = [];
	for (var i in data.pages) this.pages[i] = new Vespy.Page(data.pages[i],this); 
	for (var i in data.datatables) this.datatables[i] = new Vespy.DataTable(data.datatables[i],this); 
}

Vespy.Builder.prototype.draw = function(target) {
	var el = $("<div class='title'>"+this.title+"</div>");
	$(target).empty().append(el);
};

Vespy.Builder.prototype.save = function() {
	var req = new XMLHttpRequest();
    req.open("GET", "retrieve?intent=save_app");
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onreadystatechange = function() {
        if (req.readyState != 4 || req.status != 200) return;
        Vespy.builder = new Vespy.Builder(JSON.parse(req.responseText));
        Vespy.prog = Vespy.builder;   // prog is a proxy for builder or runtime
        Vespy.documentBody = $(".template").get(0);
    };
    req.send();
};
Vespy.Builder.prototype.serialize = function() {
	//
};

