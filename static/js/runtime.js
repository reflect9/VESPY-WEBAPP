/*
Vespy.runtime is the main code for working pages in runtime. It does the following stuff. 
	- Load nodes of the current page
	- Create node objects in Javascript
	- Attach Trigger nodes to event handlers
*/
Vespy.Runtime = function(nodes, src, target_el) {
	this.nodes = nodes;
	this.src = src;
	this.target_el = target_el;
	this.update_next_node_property(this.nodes); // Update "next" property of every node
};
Vespy.Runtime.prototype.draw = function() {
	$(this.target_el).empty();
	this.template = new Vespy.Template(this.target_el, this.src);
	this.template.draw();
};
Vespy.Runtime.prototype.execute = function() {
	_.each(this.nodes, function(n) { n.executed=false; n.V=[]; });
	var page_triggers = _.filter(this.nodes, function(node) {
		return 	node.P && node.P.param && node.P.type=='trigger' && 
				node.P.param.event_source=="page"; 
	});
	var triggered_nodes = _.uniq(_.flatten(_.map(page_triggers, function(t){ return t.next; })));
	this.run_triggered_nodes(triggered_nodes, false, false);
};
Vespy.Runtime.prototype.run_triggered_nodes = function(starting_nodes, _nodes, skip_redraw) {
	var nodes = (_nodes)? _.clone(_nodes): _.clone(this.nodes); // clone all the nodes (or provided nodes)
	var nodesToExecute = this.get_reachable_nodes(starting_nodes, nodes, true); // including starting nodes
	_.each(nodesToExecute, function(n) { n.executed = false; });	
	if(nodesToExecute==undefined || nodesToExecute.length==0 ) return;
	var queue = _.clone(starting_nodes);
	var count=0;
	while(queue.length>0 && count<nodes.length){
		// console.log(_.map(this.nodes, function(n){ return n.executed; }));
		console.log(_.map(this.nodes, function(n){ return n.next; }));
		var n = queue.pop();
		this.run_node(n, true);
		n.executed = true;
		var nodes_ready = this.get_ready_nodes(nodesToExecute, nodes);
		// var nodes_ready_not_yet_run = _.difference(nodes_ready, executed);
		queue = _.union(queue, nodes_ready);
		count++;
	}
};
Vespy.Runtime.prototype.run_node = function(node, skip_redraw) {
	if(node.P && node.P.type!="trigger") node.executed = true;
	if(!node) return false;
	if(!node.P) return false;
	// pg.planner.execute(node);
	node.execute();
};
///////////////////////////////////////////////////////////////////
///  Node getters
///////////////////////////////////////////////////////////////////
Vespy.Runtime.prototype.get_nodes = function() {
	return this.nodes;
};

Vespy.Runtime.prototype.get_adjacent_node = function(direction, node, _allNodes) {
	var allNodes = (_allNodes)?_allNodes: this.get_nodes();
	if(!direction || !node) return false;
	if(direction=="_left") return this.get_node_by_position([node.position[0], node.position[1]-1], allNodes);			
	if(direction=="_right") return this.get_node_by_position([node.position[0], node.position[1]+1], allNodes);			
	if(direction=="_above") return this.get_node_by_position([node.position[0]-1, node.position[1]], allNodes);			
	if(direction=="_below") return this.get_node_by_position([node.position[0]+1, node.position[1]], allNodes);							
	return false;
};

Vespy.Runtime.prototype.get_node_by_id = function(node_id, ref_node, _allNodes) {
	var allNodes = (_allNodes)?_allNodes: this.get_nodes();
	if(node_id===undefined || node_id===false) return false;
	if(node_id.substring(0,5) == '_left' && ref_node) {
		var new_node_id = node_id.substring(5); var old_node_id = node_id.substring(0,5);
		if(new_node_id.length>0) return this.get_adjacent_node("_left", this.get_node_by_id(new_node_id,ref_node), allNodes);
		else return this.get_adjacent_node("_left", ref_node, allNodes);	
	} else if(node_id.substring(0,6) == '_above' && ref_node)  {
		var new_node_id = node_id.substring(6); var old_node_id = node_id.substring(0,6);
		if(new_node_id.length>0) return this.get_adjacent_node("_above", this.get_node_by_id(new_node_id,ref_node), allNodes);
		else return this.get_adjacent_node("_above", ref_node, allNodes);	
	} else if(node_id.substring(0,6) == '_right' && ref_node)  {
		var new_node_id = node_id.substring(6); var old_node_id = node_id.substring(0,6);
		if(new_node_id.length>0) return this.get_adjacent_node("_right", this.get_node_by_id(new_node_id,ref_node), allNodes);
		else return this.get_adjacent_node("_right", ref_node, allNodes);	
	} else if(node_id.substring(0,6) == '_below' && ref_node)  {
		var new_node_id = node_id.substring(6); var old_node_id = node_id.substring(0,6);
		if(new_node_id.length>0) return this.get_adjacent_node("_below", this.get_node_by_id(new_node_id,ref_node), allNodes);
		else return this.get_adjacent_node("_below", ref_node, allNodes);	
	}
	//
	for(var i in allNodes) {
		if (allNodes[i].ID == node_id) return allNodes[i];
	}	return false;
};
Vespy.Runtime.prototype.get_node_by_position = function(position, _allNodes) {
	var allNodes = (_allNodes)?_allNodes: this.get_nodes();
	if(position===undefined || position===false) return false;
	for(var i in allNodes) {
		if (allNodes[i].position[0] == position[0] && allNodes[i].position[1] == position[1]) return allNodes[i];
	}	return false;
};	
Vespy.Runtime.prototype.update_next_node_property = function(nodes) {
	// nodes are originally singly-linked graph (backward). This method updates next property of each node
	// to point following nodes that this the current node as input.  
	_.each(nodes, function(node){ node.next = []; });
	// 
	_.each(nodes, function(node){
		_.each(node.I, function(input_node_id){
			var prev_node = this.get_node_by_id(input_node_id, node);
			if(prev_node){
				prev_node.next = _.union(prev_node.next, node);	
			}
		},this);
	},this);
};
Vespy.Runtime.prototype.get_reachable_nodes = function(_starting_nodes, scope_nodes, _include_triggers) {
	_.each(scope_nodes, function(n){ n.visited=false; });
	var queue = _.clone(_starting_nodes);
	while(queue.length>0) {
		var n = queue.pop();
		for (var i=0;i<n.next.length;i++){
			var next_n = n.next[i];
			if (_.indexOf(scope_nodes, next_n)==-1) { continue; }
			if(!next_n.visited) {
				if(!_include_triggers && next_n.P && next_n.P.type=="trigger") { continue; }
				queue.push(next_n);
				next_n.visited = true;
			}
		}
	}
	var reachable_nodes = _.filter(scope_nodes, function(n){ 
		return n.visited==true; });
	_.each(scope_nodes, function(n){ delete n.visited; }); 
	return reachable_nodes;
};
Vespy.Runtime.prototype.get_prev_nodes = function(node, _allNodes) {	
	var allNodes = (_allNodes)?_allNodes: this.get_nodes();
	var prevNodes = [];
	try{
		for(var i=0;i<node.I.length;i++) {
			prevNodes.push(this.get_node_by_id(node.I[i], node, allNodes));
		}	
	} catch(e) { 
		console.log(e.stack); }
	prevNodes = _.without(prevNodes, false, undefined);
	return prevNodes;
};
Vespy.Runtime.prototype.get_ready_nodes = function(_candidateNodes, _allNodes) {
	var allNodes = (_allNodes)?_allNodes: this.get_nodes();
	var candidateNodes = (_candidateNodes)? _candidateNodes: allNodes;
	var ready_nodes = _.filter(candidateNodes, function(n) {
		if(n.executed) return false;
		var prev_nodes = this.get_prev_nodes(n, allNodes);
		if (	prev_nodes.length>0 &&
				_.filter(prev_nodes, function(n) { return n.executed==false; }).length==0 ) 
			return true;
		else return false;	
	},this);
	return ready_nodes;
};
