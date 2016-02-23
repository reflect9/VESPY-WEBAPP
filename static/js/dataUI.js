Vespy.dataUI = {
	create: function(el, pos) {
		if(Vespy.grid.selected_element && Vespy.grid.selected_element==el) {
			Vespy.dataUI.remove();
			Vespy.grid.selected_element = null;
			return;
		} else {
			Vespy.grid.selected_element = el; 
			Vespy.dataUI.remove();
		}
		var ui_el = $("<div id='dataUI'>\
				<div class='parents_list'></div>\
				<div class='pg_data_tools'></div>\
				<div class='pg_data_table'></div>\
			</div>\
			");
		var parents_el = $(ui_el).find(".parents_list").get(0);  
		var tools_el = $(ui_el).find(".pg_data_tools").get(0);  
		var attributes_el = $(ui_el).find(".pg_data_table").get(0);  

		Vespy.data_selection_box = new Vespy.SelectionBox(3);
		Vespy.data_selection_box.highlight(el);
	
		_.each($($(el).parentsUntil('html').get().reverse()), function(p) {
			$("<span>"+$(p).prop("tagName")+"&gt; </span>").click($.proxy(function() {
				Vespy.dataUI.create(this.p, pos);
			},{p:p}))
			.hover($.proxy(function(){
				Vespy.parent_selection_box = new Vespy.SelectionBox(3, '#0000FF');
				Vespy.parent_selection_box.highlight(this.p);
			},{p:p}),function(){
				if(Vespy.parent_selection_box) {
					Vespy.parent_selection_box.hide();
					Vespy.parent_selection_box.destroy();	
				}
			})
			.appendTo(parents_el);
		});
		$("<span style='color:red'>"+$(el).prop("tagName")+"</span>").appendTo(parents_el);

		$("<button>Extract</button>").click($.proxy(function() {
			Vespy.commandUI.addData(this.el);
		},{el:el})).appendTo(tools_el);
		$("<button>Send to other tabs</button>").click($.proxy(function() {
			// Vespy.share_elements([this.el]);
		},{el:el})).appendTo(tools_el);

		// DRAW DATA TABLE
		var attr_dict = get_attr_dict(el);  // get_attr_dict returns simplified attr->value object
		_.each(attr_dict, function(value,key) {
			var attr_el = $("<div class='attr'><span class='attr_key'>"+ key +":</span></div>").appendTo(attributes_el);
			var attr_setter_func = Vespy.planner.attr_func(key).setter;
			$("<span class='attr_value' contenteditable='true' original_value='"+value+"'>"+value+"</span>").bind("blur", $.proxy(function(e) {
				if($(e.target).attr('original_value')===$(e.target).text()) return; 
				var new_value = $(e.target).text();
				console.log("new value:"+new_value);
				$(e.target).attr('original_value',new_value);
				this.setter(this.el,new_value);
				// pg.history.put({type:'set_attribute',target:el,key:key,value:new_value});
				// pg.history.infer();
			},{key:key, original_value:value, setter:attr_setter_func, el:el})).appendTo(attr_el);
		});	

		// PLACE DATA UI PANEL
		var x = Math.min(pos.x+$(window).scrollLeft(), $(window).width()-300+$(window).scrollLeft()); 
		$(ui_el).css("top", pos.y + $(window).scrollTop() + 20);
		$(ui_el).css("left", x);
		$(Vespy.documentBody).append(ui_el).show('fast');
		return ui_el;
	},
	remove: function() {
		if(Vespy.parent_selection_box) {
			Vespy.parent_selection_box.hide();  
			Vespy.parent_selection_box.destroy();	
			Vespy.parent_selection_box=undefined;
		}
		if(Vespy.data_selection_box) {
			Vespy.data_selection_box.hide();  
			Vespy.data_selection_box.destroy();	
			Vespy.data_selection_box=undefined;
		}
		$("#dataUI").remove();
	}
};