Vespy.Grid = function(target, page) {
	this.target = target;
	this.page = page;
	this.node_dimension = 85;
	this.commandUI = undefined;
};
// DRAWING GRID UI
Vespy.Grid.prototype.draw = function() {
	this.target.empty();
	this.target.append("<div id='overlay'><svg></svg></div>");
	this.target.append("<div id='tiles'></div><div id='plate'></div>");
	this.redraw();
};
Vespy.Grid.prototype.redraw = function() {
	var nodes = this.page.get_nodes();
	var tiles = $(this.target).find("#tiles");
	$(this.target).find("#tiles > .node").remove();
	for (ni in nodes) {
		nodes[ni].draw(tiles);
	}
	this.addEventListeners();
};
Vespy.Grid.prototype.drawPlate = function() {
	var canvas = $("<canvas id='plate_canvas' width='3000' height='3000'></canvas>");
	$(this.target).find("#plate").children().remove().append(canvas);
	var ctx = canvas.get(0).getContext("2d");
	ctx.strokeStyle = "#ddd";
	var num_row = Math.round(app.DEFAULT_PLATE_DIMENSION / this.node_dimension);
	var num_col = Math.round(app.DEFAULT_PLATE_DIMENSION / this.node_dimension);
	for (r=0;r<num_row;r++) {
		for(c=0;c<num_col;c++) {
			ctx.moveTo(c*this.node_dimension, r*this.node_dimension-5);
			ctx.lineTo(c*this.node_dimension, r*this.node_dimension+5);
			ctx.stroke();
			ctx.moveTo(c*this.node_dimension-5, r*this.node_dimension);
			ctx.lineTo(c*this.node_dimension+5, r*this.node_dimension);
			ctx.stroke();
		}
	} 
};
Vespy.Grid.prototype.drawConnector_node_list = function(_nodes) {
	var node_list = _nodes || Vespy.page.get_nodes();
	_.each(node_list, function(n) {
		var n_el = $(".node#"+n.ID); 
		if(n_el.length==0) return;
		_.each(n.I, function(inp_n_id,idx){
			if(Vespy.page.enhancement.get_adjacent_node(inp_n_id, n)!= false) {
				$(n_el).attr('border'+inp_n_id,true);	
				$(n_el).find(".node_borders").find("."+inp_n_id.slice(1)).find(".nth-input").text(idx+1);
			} else {
				// var from_node_el = $(".node#"+inp_n_id);
				// var to_node_el = $(".node#"+n.ID);
				// if(from_node_el.length==0 || to_node_el.length==0) return;
				// Vespy.page.drawConnector($(from_node_el).position(), $(to_node_el).position());
			}
		});
	});
};
Vespy.Grid.prototype.drawConnector_two_nodes = function(_fromNode, _toNode, nth_input) {
	var from_node_el = $(".node#"+_fromNode.ID);
	var to_node_el = $(".node#"+_toNode.ID);
	if(from_node_el.length==0 || to_node_el.length==0) return;
	Vespy.grid.drawConnector(from_node_el, to_node_el, nth_input);
};
Vespy.Grid.prototype.drawConnector = function(_fromEl, _toEl, nth_input) {
	var marginPortion = 0.1;
	var margin = $(_fromEl).width()*marginPortion;
	var fromPos = {left: $(_fromEl).position().left+margin, top:$(_fromEl).position().top+$(_fromEl).height()-margin};
	var toPos = {left: $(_toEl).position().left+margin, top:$(_toEl).position().top+margin};
	var svg = $("#overlay > svg");
	var newLine_shadow = document.createElementNS('http://www.w3.org/2000/svg','line');
	newLine_shadow.setAttribute('x1',fromPos.left+1); 	newLine_shadow.setAttribute('y1',fromPos.top);
	newLine_shadow.setAttribute('x2',toPos.left+1); 	newLine_shadow.setAttribute('y2',toPos.top);
	newLine_shadow.setAttribute('class','path_connector_shadow');
	$(svg).append(newLine_shadow);

	var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
	newLine.setAttribute('x1',fromPos.left); 	newLine.setAttribute('y1',fromPos.top);
	newLine.setAttribute('x2',toPos.left); 	newLine.setAttribute('y2',toPos.top);
	newLine.setAttribute('class','path_connector');
	$(svg).append(newLine);
	
	if(typeof nth_input !== 'undefined') {
		var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
		rect.setAttribute('x', fromPos.left-6);	rect.setAttribute('y', fromPos.top-6);
		rect.setAttribute('rx', 2);	rect.setAttribute('ry', 2);
		rect.setAttribute('width', 12);	rect.setAttribute('height', 12);
		$(svg).append(rect);
		var nth =  document.createElementNS('http://www.w3.org/2000/svg','text');
		nth.setAttribute('text-anchor','middle');
		nth.setAttribute('x',fromPos.left);
		nth.setAttribute('y',fromPos.top+4);  nth.setAttribute('fill','gray');
		$(nth).text(nth_input);
		$(svg).append(nth);

	}

};
Vespy.Grid.prototype.clearConnector = function() {
	$("#overlay > svg").empty();
};
Vespy.Grid.prototype.p2c = function(position) {
	return [position[0]*this.node_dimension, position[1]*this.node_dimension];
};


// NODE INTERACTION
Vespy.Grid.prototype.get_current_node = function() {
	return _.map($("#tiles .node[selected]").toArray(), function(nodeEl) {
				return Vespy.page.get_node_by_id($(nodeEl).prop('id'));
			})[0];
};
Vespy.Grid.prototype.select = function(node) {
	window.curnode = node; // for debugging
	var node_el = $("#"+node.ID).get(0);
	$(node_el).attr("selected",true);
	_.each(Vespy.page.get_nodes(), function(n) { n.selected=false; });
	this.node_show_inputs(node);
	node.selected = true;
	// pg.history.reset();
	if(typeof Vespy.commandUI == "undefined") {
		Vespy.commandUI = new Vespy.CommandUI($("#commandUI"), this);	
	} 
	Vespy.commandUI.redraw();	
	// Vespy.commandUI.turn_inspector(true);
};
Vespy.Grid.prototype.deselect = function(node) {
	Vespy.inspector.unhighlight_list();
	Vespy.inspector.off(Vespy.dataUI.remove);
	$("#tiles .node").removeAttr("selected");
	_.each(Vespy.page.get_nodes(), function(n) { n.selected=false; Vespy.grid.node_hide_inputs(n);});
	// this.hide_show_inputs(node);
	if (Vespy.commandUI) {
		Vespy.commandUI.updateAllParameters();
		Vespy.commandUI.hide();
		Vespy.commandUI.turn_inspector(false);
	}
	this.node_select_modal_off();
	this.redraw();
	// Vespy.toolbox.redraw(pg.planner.get_all_operations());
};
// Vespy.Grid.prototype.insert = function(new_nodes, target_node) {};
Vespy.Grid.prototype.delete = function(node) {
	Vespy.inspector.unhighlight_list();
	Vespy.inspector.off(Vespy.dataUI.remove);
	Vespy.page.delete(node);
	Vespy.commandUI.hide();
	this.redraw();
};


Vespy.Grid.prototype.node_select_modal_on = function(i) {
	$(".node .node_cover .nth-input-text").html("input"+(i+1)).removeClass("hidden").addClass("select_modal");
	$(".node .node_cover").show();
	$(".node .node_cover").removeClass("notClickable");
	$(".node .node_cover").click($.proxy(function(e) {
		var _id = $(e.target).parents(".node").attr("id");
		$("#commanUI").find("input[inputNodeIdx='"+this.i+"']").val(_id);
		(Vespy.grid.get_current_node()).I[this.i]=_id;
		e.stopPropagation();
		Vespy.grid.node_select_modal_off();
		Vespy.grid.redraw();
	},{i:i}));
};
Vespy.Grid.prototype.node_select_modal_off = function() {
	$(".node .node_cover").addClass("notClickable");
	$(".node .node_cover .nth-input-text").empty().addClass("hidden").removeClass("select_modal");
	$(".node .node_cover").hide().unbind('click');
};
Vespy.Grid.prototype.node_show_inputs = function(node) {
	//$(".node .node_cover .nth-input-text").empty().removeClass("hidden");
	$("#"+node.ID).find('.nth-input').show();
	_.each(node.I, function(input_node_id, n_th) {
		var input_node = Vespy.page.get_node_by_id(input_node_id, node);
		if(!input_node) return;
		$(".node[id='"+input_node.ID+"'] .node_cover").addClass('notClickable').show();
		if(input_node_id=='_left' || input_node_id=='_right'|| input_node_id=='_above'|| input_node_id=='_below') {
			return;
		} else {
			Vespy.grid.drawConnector_two_nodes(input_node, node, n_th+1);	
		}
	});
};
Vespy.Grid.prototype.node_hide_inputs = function(node) {
	$("#"+node.ID).find('.nth-input').hide();
	$(".node .node_cover .nth-input-text").empty();
	$(".node .node_cover").removeClass('notClickable').hide();
	Vespy.grid.clearConnector();
};





// EXECUTION RELATED
// Vespy.Grid.prototype.execute = function() {};
// Vespy.Grid.prototype.run_node = function(node, skip_redraw) {};
// Vespy.Grid.prototype.run_triggered_nodes = function(starting_nodes, _nodes, skip_redraw) {};
// Vespy.Grid.prototype.infer = function(output_node) {};

// EVENT LISTENER
Vespy.Grid.prototype.addEventListeners = function() {
	// Make node draggable, hover
	// Plate droppable
	// Backspace to delete node
	// Create a new node when tile is clicked. 
	$(".node")
		.off()
		.draggable({ 	
			cancel: "div.node_cover",
			grid: [ this.node_dimension, this.node_dimension],
			stop: function(e) {
				var node = Vespy.page.get_node_by_id($(this).attr('id'));
				if(node) {
					var position = [ Math.round($(this).position().top / Vespy.grid.node_dimension),
										Math.round($(this).position().left / Vespy.grid.node_dimension)	];
					if (_.isEqual(position,node.position)) return;
					var existing_node = Vespy.page.get_node_by_position(position);
					if(existing_node) Vespy.grid.delete(existing_node);
					node.position = position;
				}
				if(Vespy.grid.get_current_node()!=node) Vespy.grid.select(node);
				Vespy.grid.redraw();
			}
		})
		.hover(function(){
			if(Vespy.grid.get_current_node()) return;
			if($(".node .node_cover .nth-input-text").hasClass("select_modal")) return;
			var node = Vespy.page.get_node_by_id($(this).attr('id'));
			Vespy.grid.node_show_inputs(node);

		},function(){
			if(Vespy.grid.get_current_node()) return;
			if($(".node .node_cover .nth-input-text").hasClass("select_modal")) return;
			var node = Vespy.page.get_node_by_id($(this).attr('id'));
			Vespy.grid.node_hide_inputs(node);
		})
		.dblclick(function(e) {
			e.stopPropagation();
		});

	// DROPPING TASK OR OPERATION ITEMS ON GRID
	// $("#plate").droppable({
	// 	accept: ".task_item, .operation_item",
	// 	drop: function( event, ui ) {
	// 		var position = [ Math.floor((event.clientY-$(this).offset().top+$(document).scrollTop()) / Vespy.grid.node_dimension),
	// 									Math.floor((event.clientX-$(this).offset().left+$(document).scrollLeft()) / Vespy.grid.node_dimension)	];
	// 		console.log("dropped at "+position);
	// 		var existing_node = Vespy.page.get_node_by_position(position);
	// 		// pg.log.add({type:'confirm_operation',operation:Vespy.toolbox.draggingOperation});    
	// 		if(existing_node) {
	// 			existing_node.P=Vespy.toolbox.draggingOperation;
	// 			Vespy.grid.redraw();
	// 		} else {
	// 			var new_node = new Vespy.Node(pg.toolbox.draggingOperation, Vespy.page);
	// 			new_node.position = position;
	// 			Vespy.page.push_at(new_node, position);
	// 			Vespy.grid.deselect();
	// 			Vespy.grid.select(new_node);
	// 		} 
	// 	}
	// });
	$(".node .node_content").click(function(e) {
		var n = $(e.target).parents(".node");
		if($(n).is('.ui-draggable-dragging')){
			return;
		}
		var node = Vespy.page.get_node_by_id($(n).attr('id'));
		var previously_selected_node = Vespy.grid.get_current_node();
		console.log(node);
		if(node==previously_selected_node) {
			Vespy.grid.deselect();
			console.log("deselectiong")	;
		} 
		else {
			Vespy.grid.deselect();
			Vespy.grid.select(node);
		}
		e.stopPropagation();
	})
	// Assign backspace button to delete node. Prevent page back navigation
	$(document).off("keydown").keydown(function (e) {
	    var element = e.target.nodeName.toLowerCase();
	    var contenteditable = $(e.target).attr("contenteditable");
	    console.log(element);
	    if ((element != 'input' && element != 'textarea' && !contenteditable) || $(e.target).attr("readonly")) {
	        if (e.keyCode === 8 || e.keyCode === 46) {
	        	if(document.activeElement.tagName==='SPAN') return;
	        	var selected_node = Vespy.grid.get_current_node();
	        	if(selected_node) {
	        		Vespy.grid.delete(selected_node);	
	        	}
	            return false;
	        }
	    }
	});
	var el_tiles = $("#tiles");
	$(el_tiles).off('click').click(function(e) {
		if(Vespy.grid.get_current_node()) {
			Vespy.grid.deselect();
			return;
		} else {
			var mouse_coord = {left: e.pageX - $(this).offset().left,
								top: e.pageY - $(this).offset().top};
			var mouse_pos = {left: Math.floor(mouse_coord.left/Vespy.grid.node_dimension), 
							top: Math.floor(mouse_coord.top/Vespy.grid.node_dimension)};
			e.stopPropagation();
			console.log("plate clicked "+ mouse_pos.left + "," +mouse_pos.top);
			var new_node = new Vespy.Node();
			new_node.position = [mouse_pos.top, mouse_pos.left];
			Vespy.page.get_nodes().push(new_node);
			Vespy.grid.deselect();
			Vespy.grid.redraw();
			Vespy.grid.select(new_node);

			Vespy.commandUI.redraw();
		}
	});
	// Prevent scrolling body when mouse is over panel element.
	// $("#pg_panel").hover(function() {
	// 	$("body").css("overflow","hidden");
	// },function() {
	// 	$("body").css("overflow","auto");
	// });

};






