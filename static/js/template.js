Vespy.Template = function(src, page) {
	this.target = undefined;
	this.src = src;
	this.editor = undefined;
	this.page = page;
};
Vespy.Template.prototype.serializable = function() {	
	return { "src": this.src };
};
Vespy.Template.prototype.set_target = function(target_el) {	
	this.target = target_el;
};
Vespy.Template.prototype.draw = function() {	
	$(this.editor).addClass("hidden");
	if (typeof this.target != "undefined") {
		$(this.target).removeClass("hidden").empty().append(this.src);	
		this.redraw();
	} else {
		alert("template target is undefined");
	}
};
Vespy.Template.prototype.redraw = function() {
	// When updating somethinag
};

// EDITING RELATED FUNCTIONS
Vespy.Template.prototype.attach_editor = function(editor_el) {
	this.editor = editor_el;
	$(editor_el).attAttr("template_editor");
};
Vespy.Template.prototype.detach_editor = function() {
	$(this.editor_el).removeAttr("id");
	this.editor = undefined;
};
Vespy.Template.prototype.start_edit = function() {
	if (typeof this.editor == "undefined") return;
	// Start Editing mode
	this.editor = ace.edit("template_editor");
	this.editor.setTheme("ace/theme/monokai");
	this.editor.setValue(this.src);
	this.editor.getSession().setMode("ace/mode/HTML");
	$(this.target).find("#template_editor").removeClass("hidden");
	$(this.target).addClass("hidden");
};
Vespy.Template.prototype.complete_edit = function() {
	this.src = this.editor.getValue();
	this.editor.destroy();
	this.editor = undefined;
	this.draw();
};
Vespy.Template.prototype.toggle_edit = function() {
	if (typeof this.editor == "undefined") {
		this.start_edit();
	} else {
		this.complete_edit();
	}
};