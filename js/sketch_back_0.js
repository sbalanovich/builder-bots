var nodes = [];
var edges = [];
var agents = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	frameRate(30);

	tr = new Truss();
    tr.initiate();

}


function draw() {
	background(191);

	if (frameCount % 30 == 0 && frameCount < 200) {
		tr.step();
		//console.log(nodes.length);
	} 

	for (var i = 0, length = edges.length; i < length; i++) {
		edges[i].render();		
	}

	for (var i = 0, length = nodes.length; i < length; i++) {
		nodes[i].render();		
	}

	for (var i = 0, length = agents.length; i < length; i++) {
		agents[i].render();		
	}


}


/*function mousePressed() {
	var n = new Node(mouseX, mouseY);
	nodes.push(n);

	return false;
}*/



function Node(id, xPos, yPos, mask, state) {
	this.id = id;

	this.x = xPos;
	this.y = yPos;

    this.isOccupied = false;
    
    this.m = 0x3f;
    this.state = 0;

    this.e = [];
    for (var i = 0; i < 6 ; i++){
    	e.push(undefined);
    }

    this.hasEdge = function(i) {
    	var is = (this.state & (0x01 << i)) != 0;
    	console.log(this.id + " hasEdge " + i + " : ", is);
      	return is;
    }

    this.canAdd = function (i) {
      	return (this.m & (0x01 << i)) != 0;
    }

    this.enableEdge = function (i, edge) {
		if (!this.canAdd(i)) return false;
		if (this.hasEdge(i)) return false;

		this.state |= (0x01 << i);

		return true;
    }

    this.disableEdge = function(i) {
		if (!this.hasEdge(i)) return false;

		this.state &= ~(0x01 << i);

		return true;
    }
	
	this.render = function() {
		ellipse(this.x, this.y, 10, 10);
		text(this.id, this.x, this.y);
	}

}

function Edge(n0, n1){
    this.n0 = n0;
    this.n1 = n1;

    this.render = function() {
		line(this.n0.x, this.n0.y, this.n1.x, this.n1.y);
	}
}


function Agent(tr, n){

    this.behaviors = [];// = new Behaviors();

    //this.behaviors.push(new BuildUp());
    //this.behaviors.push(new WalkDown());

    this.CurrentBehavior = "BuildUp";//this.behaviors[0];
    /*public void Reset() {
      n = tr.nodes[0];
      CurrentBehavior = behaviors[4];
      color = Color.FromArgb(0, 0, 0);
    }*/

    this.n = n;

    this.update = function(tr){
        //this.CurrentBehavior.Step(this, tr);
        BuildUp(this, tr);
    }

    this.render = function() {
		ellipse(this.n.x, this.n.y, 20, 20);
	}
}


// ████████╗██████╗ ██╗   ██╗███████╗███████╗
// ╚══██╔══╝██╔══██╗██║   ██║██╔════╝██╔════╝
//    ██║   ██████╔╝██║   ██║███████╗███████╗
//    ██║   ██╔══██╗██║   ██║╚════██║╚════██║
//    ██║   ██║  ██║╚██████╔╝███████║███████║
//    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝


function Truss() {

    this.numAgents = 4;
    this.dirs = [];
    var sl = 50;
    var nodeId = 0;

    for (var i = 0; i < 6; ++i){
        var a = i * 2.0 * Math.PI / 6.0;
        this.dirs[i] = [sl * Math.cos(a), -sl * Math.sin(a)];
    }

    this.pairs = [3, 4, 5, 0, 1, 2];

    this.initiate = function () {
        var n = new Node(nodeId, 20, windowHeight - 20, 0x3f, 0);
        nodes.push(n);
        nodeId++;
        for(var i = 0; i < this.numAgents; i++){
            this.addAgent(n);
        }
    }

    this.step = function () {
		console.log("truss step");
        for (var i = 0; i < agents.length; ++i){
            agents[i].update(this);

        }

    }        

    // Add and remove elements on the truss object
    this.addAgent = function (n){
        var a = new Agent(this, n);
        agents.push(a);
    }

    this.addNode = function (xPos, yPos) {

        var n = new Node(nodeId, xPos, yPos, 0x3f, 0);
        nodes.push(n);

        nodeId++;
        return n;
    };

    this.extendNode = function(n0, i) {

      if (n0.hasEdge(i)){
      	console.log("extendNode thinks hasEdge = true");
      	return n0.e[i];
      } 
      else{
      	console.log("extendNode thinks hasEdge = false");
      }
      if (!n0.canAdd(i)) return null;

      var nX = n0.x + this.dirs[i][0];
      var nY = n0.y + this.dirs[i][1];

      var n1 = this.addNode(nX, nY);

      var ed = this.addEdge(n0, n1);

      if (ed == null){
        return null;
      }

      var enabled0 = n0.enableEdge(i);
      n0.e[i] = ed;

      n1.enableEdge(this.pairs[i]);
      n1.e[this.pairs[i]] = ed;

      return ed;
    }

    this.addEdge = function(n0, n1) {

      var e = new Edge(n0, n1);
      edges.push(e);
      return e;
    }

    this.containsNode = function (n0, i){
      if (n0.hasEdge(i)) return true;
      if (!n0.canAdd(i)) return false;

      var nX = n0.x + this.dirs[i][0];
      var nY = n0.y + this.dirs[i][1];

      if (nX > windowWidth || nX < 0) return false;
      if (nY > windowWidth || nY < 0) return false;

      return true;
    }

}


//  ██████╗ ██╗   ██╗██╗██╗     ██████╗     ██╗   ██╗██████╗
//  ██╔══██╗██║   ██║██║██║     ██╔══██╗    ██║   ██║██╔══██╗
//  ██████╔╝██║   ██║██║██║     ██║  ██║    ██║   ██║██████╔╝
//  ██╔══██╗██║   ██║██║██║     ██║  ██║    ██║   ██║██╔═══╝
//  ██████╔╝╚██████╔╝██║███████╗██████╔╝    ╚██████╔╝██║
//  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝      ╚═════╝ ╚═╝

function BuildUp (a, tr){

	//this.Step = function ( a, tr){

	//if (!base.Step(a, tr)) return false;
	// find the node that the agent is sitting on
	var n = a.n;

	var StoreWeights = [20, 30, 30, 20, 0, 0];
	var weights =  [20, 30, 30, 20, 0, 0];

	var target = [30.0, 30.0];

	// TRY TO MOVE
	for(var i = 0; i < 6; i++) {
		if(weights[i] == 0) continue;

		// if the node doesn't have that edge, the probability is 0
		if(!n.hasEdge(i)){
			weights[i] = 0;
			continue;
		}

		// if the edge is under too much stress, the probability is 0
		var ee = n.e[i];

		// if the node is occupied, the probability is 0
		var N0 = ee.n0;
		var N1 = ee.n1;

		var nextNode = N0;
		if (nextNode.id == n.id) nextNode = N1;

		if (nextNode.isOccupied){
			weights[i] = 0;
			continue;
		}
	}

	// if there is only one move choice, switch to build instead
	var choices = 0;
	for(var i = 0; i < 6; i++) {
		if (weights[i] != 0) choices++;
	}
	if (choices < 2){
		for(var i = 0; i < 6; i++) {
			weights[i] = 0;
		}
	}

	var strutIndex = GetRandom(weights);

	if (strutIndex < 6){
		var ee = n.e[strutIndex];

		if (ee != null){
			var N0 = ee.n0;
			var N1 = ee.n1;

			var nextNode = N0;
			if (nextNode.id == n.id) nextNode = N1;

			//console.log(nextNode);
			a.n = nextNode;
			nextNode.isOccupied = true;
			n.isOccupied = false;
			return true;
		}
		else{
			console.log("fail");
		}
	}

	// TRY TO BUILD
	weights = StoreWeights;

	for(var i = 0; i < 6; i++) {
		if(weights[i] == 0) continue;

		var inWorkSpace = tr.containsNode(n, i);

        if(!inWorkSpace){
          weights[i] = 0;
          continue;
        }
		// if the node can't add that edge, the probability is 0
		//if(!n.CanAdd(i)){ // why does it think it can't add edges at first?
		if(n.hasEdge(i)){
			weights[i] = 0;
			continue;
		}
	}

	strutIndex = GetRandom(weights);

	if (strutIndex < 6){
		var ee = tr.extendNode(n, strutIndex);

		if (ee != null){
			//a.n = nodes[0];
			//a.CurrentBehavior = a.behaviors[1];
		}
		else{
			console.log("fail");
		}
	}

	return false;
//}
}




function GetRandom(weights)  {
	// find cumulative weights
	//console.log("getting random");
	var total = 0;
	for(var i = 0; i < 6; i++) {
		total += weights[i];
	}

	var count = 0;
	for(var i = 0; i < 6; i++) {
		weights[i] = (weights[i] / total) * 100 + count;
		count = weights[i];
	}

	// choose random remaining value
	var rr = Math.random() * 100;
	var strutIndex = 6;

	for(var i = 0; i < 6; i++) {
		if(rr < weights[i]){
			strutIndex = i;
		  	return strutIndex;
		}
	}
	return strutIndex;
}