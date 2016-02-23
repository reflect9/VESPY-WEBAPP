/*	It allows users to extract data from any web pages by selection
 */
Vespy.inspector = {
	flag_inspect: false,
	selectionBox: null,
	hoveredElement: null,
	callback:null,
	selectionBox_list:[],
	// toggle: function(callback) {
	// 	if(!Vespy.inspector.flag_inspect) {
	// 		Vespy.inspector.on(callback);
	// 	} else {
	// 		Vespy.inspector.off();
	// 	}
	// },
	on : function(callback) {
		if(Vespy.inspector.flag_inspect) Vespy.inspector.off();
		document.addEventListener('mousemove', Vespy.inspector.onMouseMove, true);
		document.addEventListener('mouseover', Vespy.inspector.onMouseOver, true);
		document.addEventListener('mousedown', Vespy.inspector.onMouseDown, true);
		document.addEventListener('click', Vespy.inspector.onMouseClick, true);
		Vespy.inspector.flag_inspect = true;
		Vespy.inspector.selectionBox = new Vespy.SelectionBox();
		Vespy.inspector.callback = callback;
	},
	off : function(callback) {
		document.removeEventListener('mousemove', this.onMouseMove, true);
		document.removeEventListener('mouseover', this.onMouseOver, true);
		document.removeEventListener('mousedown', this.onMouseDown, true);
		document.removeEventListener('click', this.onMouseClick, true);
		if(callback) callback();
		Vespy.inspector.flag_inspect = false;
		Vespy.inspector.callback = null;
		if(Vespy.inspector.selectionBox) Vespy.inspector.selectionBox.destroy();
	},
	createHighlighter: function() {
		Vespy.inspector.selectionBox = new Vespy.SelectionBox();
	},
	destroyHighlighter: function() {
		if (Vespy.inspector.selectionBox) {
			Vespy.inspector.selectionBox.destroy();
			delete Vespy.inspector.selectionBox;
		}
	},
	highlight: function(el) {
		if (!Vespy.inspector.selectionBox)
			Vespy.inspector.createHighlighter();
		Vespy.inspector.hoveredElement = el;
		Vespy.inspector.selectionBox.highlight(el);
	},
	unhighlight: function() {
		Vespy.inspector.hoveredElement = null;
		if (Vespy.inspector.selectionBox)
			Vespy.inspector.selectionBox.hide();
	},
	highlight_list: function(els) {
		Vespy.inspector.hoveredElement_list = els;
		Vespy.inspector.selectionBox_list = [];
		_.each(els, function(el) {
			var sb = new Vespy.SelectionBox();
			sb.highlight(el);
			Vespy.inspector.selectionBox_list.push(sb);
		});
	},
	unhighlight_list: function() {
		Vespy.inspector.hoveredElement_list = null;
		_.each(Vespy.inspector.selectionBox_list, function(sb) {
			sb.hide();
			sb.destroy();
		});
		Vespy.inspector.selectionBox_list = [];
	},
	onMouseOver: function(e) {
		if (Vespy.inspector.belongsToPallette(e.target)) {
			Vespy.inspector.unhighlight();
			return true;
		}
		e.preventDefault();
		e.stopPropagation();
		Vespy.inspector.highlight(e.target);
	},
	onMouseMove: function(e) {
		if (Vespy.inspector.belongsToPallette(e.target)) {
			Vespy.inspector.unhighlight();
			return true;
		}
		e.preventDefault();
		e.stopPropagation();
		Vespy.inspector.highlight(e.target);
	},
	onMouseDown: function(e) {
		if (!Vespy.inspector.belongsToPallette(e.target)) {
			e.preventDefault();
			e.stopPropagation();
			Vespy.inspector.callback(e.target, {x:e.clientX, y:e.clientY});
			// Vespy.panel.tool.pushValue(e.target);
			return false;
		}
	},
  /**
    * When the user clicks the mouse
    */
	onMouseClick: function(e) {
		if (!Vespy.inspector.belongsToPallette(e.target)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	},
	belongsToPallette: function(el) {
		var systemElements = ["#floating_panel","#top_bar","#commandUI","#grid"];
		var $el = $(el);
		for (i in systemElements){
			var se = systemElements[i];
			var parent = $el.closest(se);
				if (parent.length !== 0)
				return true;
		}
		return false;
	}
};
