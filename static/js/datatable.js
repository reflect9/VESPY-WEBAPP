// Constructor for DataTable Class
Vespy.DataTable = function(data) {
	this._initialData = {};
	for (var attrname in data) { 
		this._initialData[attrname] = data[attrname]; 
		this[attrname] = data[attrname]; 
	}
}
Vespy.DataTable.prototype.serializable = function() {
	return this;
};
Vespy.DataTable.prototype.draw = function(target) {
	var el = $("<div class='title'>"+this.title+"</div>\
		<div class='table'></div>\
		");
	$(target).empty().append(el);
};

