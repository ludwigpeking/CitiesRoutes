class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.neighbours = [];
    }

    addNeighbour(node) {
        this.neighbours.push({
            node: node,
            distance: dist(this.x, this.y, node.x, node.y)
        });
    }
} 

class City extends Node {
    constructor(x, y, weight) {
        super(x, y);
        this.weight = weight;
        this.diameter = Math.sqrt(weight);
        this.neighbours = [];
    }
    
    addNeighbour(node) {
        this.neighbours.push({
            node: node,
            distance: dist(this.x, this.y, node.x, node.y)
        });
    }
}


class Road {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
        this.active = false;
        this.distance = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
    }
}

let cities = [];
let intermediates = [];
let nodes=[];
let triangles = [];
let points = [];
let genePool=[];
let delaunay;
let sizeOfInitialGenePool = 100;
const numberOfCities = 10;
const numberOfIntermediates = 10;

function setup() {
  randomSeed(18);
  createCanvas(720, 400);
    
    points = [];
    genePool = [];

    // generate random cities
    for (let i = 0; i < numberOfCities; i++) {
    cities.push(new City(random(width - 50) + 25, random(height - 50) + 25, 2 ** random(8)));
    nodes.push(cities[i]);
    points.push([cities[i].x, cities[i].y, cities[i].diameter]);    
    }
    //generate sets of random intermediate nodes
    for (let i = 0; i < sizeOfInitialGenePool; i++) {
        let temp = [];
        for (let j = 0; j < numberOfIntermediates; j++) {
            temp.push(new Node(random(width - 50) + 25, random(height - 50) + 25));
        }
        genePool.push(temp);
    }
    // run fitness function on each set of intermediate nodes
    for (let i = 0; i < sizeOfInitialGenePool; i++) {
           genePool[i].fitness = fitness(genePool[i]);
    }


//     // generate random intermediate nodes
//     for (let i = 0; i < numberOfIntermediates; i++) {
//         intermediates.push(new Node(random(width - 50) + 25, random(height - 50) + 25));
//         nodes.push(intermediates[i]);
//         points.push([intermediates[i].x, intermediates[i].y, 0]);
//     }

//   delaunay = Delaunator.from(points);
//   triangles = delaunay.triangles;

  // Establish connections between nodes
//   for (let i = 0; i < triangles.length; i += 3) {
//     nodes[triangles[i]].addNeighbour(nodes[triangles[i + 1]]);
//     nodes[triangles[i + 1]].addNeighbour(nodes[triangles[i + 2]]);
//     nodes[triangles[i + 2]].addNeighbour(nodes[triangles[i]]);
//   }

}

function fitness(set){
    
    return roadCost(set) + pathCost(set);
}

function roadCost(set){
    let cost = 0;
    for (let i = 0; i < activeRoads.length; i++) {
        cost += activeRoads[i].distance;
    }
    return cost;
}

function pathCost(set){
    let cost = 0;
    for (let i = 0; i < numberOfCities; i++) {
        for (let j = 0; j < numberOfCities; j++) {
            if (i != j) {
                cost += pathfinding(i, j) * cities[i].weight * cities[j].weight;
            }
        }
    }
    return cost;
}



function draw() {
  background(200);

  // Draw the edges of the Delaunay triangulation
  stroke(100);
  noFill();

  for (let i = 0; i < triangles.length; i += 3) {
    beginShape();
    vertex(points[triangles[i]][0], points[triangles[i]][1]);
    vertex(points[triangles[i + 1]][0], points[triangles[i + 1]][1]);
    vertex(points[triangles[i + 2]][0], points[triangles[i + 2]][1]);
    endShape(CLOSE);
  }

  for (let i = 0; i < points.length; i++) {
    fill(255);
    stroke(0);
    circle(points[i][0], points[i][1], points[i][2] * 2);
    fill(0);
    noStroke();
    textSize(15);
    if (i<numberOfCities){
        text([i] + " : "+round(cities[i].weight), points[i][0] + 2, points[i][1] + 2);
    }   
  }
}

// Here is a helper function to get index of minimum distance
function minDistanceIndex(dist, visited) {
    let min = Infinity;
    let minIndex = -1;
    for (let i = 0; i < dist.length; i++) {
      if (visited[i] === false && dist[i] <= min) {
        min = dist[i];
        minIndex = i;
      }
    }
    return minIndex;
  }
  
  // The implementation of Dijkstra's algorithm
  function pathfinding(start, end) {
    // Initialize distances to infinity and visited set to false
    let dist = Array(nodes.length).fill(Infinity);
    let visited = Array(nodes.length).fill(false);
    let parent = Array(nodes.length).fill(-1);
    
    // Distance from source to itself is 0
    dist[start] = 0;
    
    // Calculate shortest path for all vertices
    for (let count = 0; count < nodes.length - 1; count++) {
      // Pick the minimum distance vertex from the set of vertices not yet visited
      let u = minDistanceIndex(dist, visited);
      
      // Mark the picked vertex as visited
      visited[u] = true;
      
      // Update distance value of the adjacent vertices of the picked vertex
      for (let v = 0; v < nodes.length; v++) {
        if (!visited[v] && nodes[u].neighbours[v] != 0 && dist[u] !== Infinity && dist[u] + nodes[u].neighbours[v] < dist[v]) {
          dist[v] = dist[u] + nodes[u].neighbours[v];
          parent[v] = u;
        }
      }
    }
    
    // Store the path
    let path = [];
    for (let i = end; i != -1; i = parent[i]) {
      path.push(i);
    }
    path.reverse();
    
    // Return the path
    return path;
  }
  
  function roadCost(){
    let totalRoadCost = 0;
    for (let i = 0 ; i < nodes.length; i++) {
      for (let j = 0 ; j < nodes[i].neighbours.length; j++){
        let distance = nodes[i].neighbours[j].distance;
        totalRoadCost += distance;
      }
    }
    return totalRoadCost / 2; // we divide by 2 because each road is counted twice
  }
  
  function travelCost(){
    let totalExertion = 0;
    for (let i = 0 ; i < cities.length; i++) {
      for (let j = 0 ; j < cities.length; j++){
        if (i !== j ){
          let path = pathfinding(i, j);
          let distance = 0;
          for (let k = 0; k < path.length - 1; k++) {
            distance += nodes[path[k]].neighbours[path[k+1]].distance;
          }
          let exertion = distance * cities[i].weight * cities[j].weight;
          totalExertion += exertion;
        }
      }
    }
    return totalExertion;
  }
  
