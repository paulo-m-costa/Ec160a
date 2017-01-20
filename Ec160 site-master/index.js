var express = require("express");
var app     = express();
var ws      = require("ws");
var extend  = require("util")._extend;

var expressWs = require("express-ws")(app);
var fs      = require("fs");

var Simulation = {
    numCars: 0,
    clients: {},
    positions: {},
    distances: {},
    crashes: {},
    lanes: {},
    velocities: {},
    maxLength: 1000,
    speedUp: 0.1,
    slowdown: 3.0 / 2,
    peakVelocity: 10,
    ids: [],
    maxLanes: 1,
    isRunning: false,
    didFinish: false,
    steps: 0,
    maxSteps: 24000, 
    uid: false,
    writeStream: false,
    hazard: false,
    name: "",

    // Step the simulation by dt
    step: function() {
        if(this.isRunning && !this.didFinish) {
            this.steps += 1;
            this.ids.forEach(function(id) {
                this.move();
            }.bind(this));
            
            this.write();

            if(this.steps == this.maxSteps) {
                this.didFinish = true;
                
                this.ids.forEach(function(id) {
                    this.writeStream.write("" + id +":" + this.payout(id) + "\n");
                }.bind(this));

                this.writeStream.end();
            }
        }   
        // send out state of simulation to server
        this.send();
    },

    payout: function(id) {
        return this.distances[id] * 0.0001 - this.crashes[id];
    },

    write: function() {
        var state = {
            positions: this.positions,
            velocities: this.velocities,
            lanes: this.lanes,
            distances: this.distances,
            ids: this.ids,
            timestep: this.steps,
            crashes: this.crashes,
            hazard: this.hazard
        };
        this.writeStream.write(JSON.stringify(state) + "\n");
    },

    // Send state of simulation to each server
    send: function() {
        var state = {
            positions: this.positions,
            lanes: this.lanes,
            ids: this.ids,
            hazard: this.hazard,
            maxLength: this.maxLength
        };

        this.ids.forEach(function(id) {
            state["id"] = id;
            if(this.clients[id].readyState == ws.OPEN) {
                state["payout"] = this.payout(id);
                this.clients[id].send( JSON.stringify(state) );
            };
        }.bind(this));

    },

    move: function() {
        this.ids.forEach(function(id) {
            this.ids.forEach(function(id2) {
                if( id != id2 && this.lanes[id] == this.lanes[id2] && 
                    this.positions[id] + 5 < this.positions[id2] + 5 && 
                    this.positions[id] + this.velocities[id] + 5 > this.positions[id2] - 5) {
                    
                    this.velocities[id] = 0;
                    this.crashes[id] += 1;
		    this.crashes[id2] += 1;
                }
            }.bind(this));
		
	    if(this.hazard && (this.positions[id] < 450) && (this.positions[id] + this.velocities[id] > 450) && this.velocities[id] > 2)
		this.crashes[id] += 1;

	    if(this.hazard && (this.positions[id] < 450) && (this.positions[id] + this.velocities[id] > 450) && (this.velocities[id] > 4)) {
	        this.crashes[id] += 1;
		console.log("Hello world");
	    }

            this.positions[id] += this.velocities[id];
            this.distances[id] += this.velocities[id];
            this.positions[id] %= this.maxLength;
        }.bind(this));

    },

    addCar: function(ws) {
        var id = this.numCars;
        this.numCars += 1;
        this.clients[id] = ws;
        this.positions[id] = 50 * id;
        this.distances[id] = 0;
        this.lanes[id] = 1;
        this.velocities[id] = 1;
        this.ids.push(id);
        this.crashes[id] = 0;
        return id;
    },

    removeCar: function(id) {
        var idx = this.ids.indexOf(id);
        if( idx != -1) {
            this.ids.splice(idx, 1);
        }
    },

    acceptCommand: function(id, command) {
        if(command == "a")
            this.accelerate(id);
        if(command == "s")
            this.slow(id);
        if(command == "up") 
            this.changeUp(id);
        if(command == "down")
            this.changeDown(id);
    },

    accelerate: function(id) {
        this.velocities[id] = Math.min(this.velocities[id] + this.speedUp, 4);
    },

    slow: function(id) {
        this.velocities[id] = this.velocities[id] / this.slowdown;
    },

    changeUp: function(id) {
        if(this.lanes[id] < this.maxLanes)
            this.lanes[id] += 1;
    },

    changeDown: function(id) {
        if(this.lanes[id] > 1) 
            this.lanes[id] -= 1;
    }
};

var simulation = extend({}, Simulation);

var runSimulation = function() {
    simulation.step();
    setTimeout(runSimulation, 10);
};

process.nextTick(runSimulation);

app.get("/", function(req, res) {
    res.sendFile("app.html", {root: "./static/"});
});

app.get("/clear", function(req, res) {
    simulation = extend({}, Simulation);
    res.redirect("/admin");
});

app.get("/run", function(req, res) {
    maxLength = parseInt(req.param("length"));
    simulation.uid =  req.param("name");
    simulation.maxLength = maxLength;
    simulation.writeStream = fs.createWriteStream("./data/run" + simulation.uid + ".txt");
    simulation.isRunning = true;
    res.redirect("/admin");
});

app.get("/admin", function(req, res) {
    res.sendFile("admin.html", {root: "./static/"});
});

app.get("/instructions", function(req, res) {
    res.sendFile("instructions.html", {root: "./static/"});
});

app.get("/hazard", function(req, res) {
    simulation.hazard = !simulation.hazard;
    res.redirect("/admin");
});

app.ws("/echo", function(ws, req) {
    var id = simulation.addCar(ws);

    ws.on("message", function(command) {
        simulation.acceptCommand(id, command);
    });

    ws.on("close", function() {
        simulation.removeCar(id);
    });

});

app.listen(80, function() {
    console.log("Starting up on port 80");
});
