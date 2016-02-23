// Constructor for App Class
Vespy = {
	DEFAULT_PLATE_DIMENSION : 3000,
	DEFAULT_NODE_DIMENSION : 85,
	NODE_MARGIN : 2,
	DEFAULT_GRID_WIDTH : 600,
	NODE_SIZE_LOW : 30,
	NODE_SIZE_MID : 80,
	NODE_SIZE_HIGH : 150,
	TILE_TYPES : ['Trigger','Page','Element','Variable','Operation'],
	MAX_INFERENCE_STEPS : 3,
	MAX_CONTEXT_NODES : 20,
	MAX_INT : 9007199254740992,
	MIN_INT : -9007199254740992,
    mode : "automatic"
};

Vespy.get_page_by_id = function(pages, page_id) {
	return pages.filter(function(p){return p['id']==page_id;})[0];
};
Vespy.get_page_by_url = function(pages, page_url) {
	return pages.filter(function(p){return p['url']==page_url;})[0];
};

Vespy.request_app_data = function(callback) {
    var req = new XMLHttpRequest();
    req.open("GET", "retrieve?intent=load_app", true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onreadystatechange = function() {
        if (req.readyState != 4 || req.status != 200) return;
        Vespy.app_json = JSON.parse(req.responseText);
	    Vespy.title = Vespy.app_json.title;
	    Vespy.pages = [];
	    Vespy.datatables = [];
	    for (var i in Vespy.app_json.pages) Vespy.pages[i] = new Vespy.Page(Vespy.app_json.pages[i]); 
	    for (var i in Vespy.app_json.datatables) Vespy.datatables[i] = new Vespy.DataTable(Vespy.app_json.datatables[i],this); 
        Vespy.documentBody = $(".template").get(0);
    	callback();
    };
    req.send();
}
Vespy.serialize = function() {
	return JSON.stringify({
		"title": Vespy.title,
		"pages": _.map(Vespy.pages, function(p){ return p.serializable(); }),
		"datatables": _.map(Vespy.datatables, function(d){ return d.serializable(); })
	});
}
Vespy.save = function(callback) {
	var req = new XMLHttpRequest();
    req.open("POST", "save", true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "data="+Vespy.serialize();
    req.onreadystatechange = function() {
        if (req.readyState != 4 || req.status != 200) {
        	return;
        } else {
        	if (typeof callback != "undefined") callback();	
        }
    };
    req.send(params);
}
// FOLLOWING CALLBACK FUNCTIONS INITIALIZE VESPY FOR RUNTIME or BUILDER mode
Vespy.initialize_runtime = function(){
    Vespy.page = Vespy.get_page_by_url(Vespy.pages, PAGE_URL);
    // Vespy.template = new Vespy.Template($("#template_wrapper"), Vespy.page.template_src);
    // Vespy.template.draw();
    Vespy.page.draw($("#template"));
    Vespy.page.execute();
};
Vespy.initialize_builder = function(){
	Vespy.page = Vespy.pages[0];
    // Vespy.page = Vespy.get_page_by_url(Vespy.pages, PAGE_URL);
    // Vespy.page.draw($("#template"));
    // Vespy.page.execute();
};

