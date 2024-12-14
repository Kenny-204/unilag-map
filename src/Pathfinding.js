class Graph {
    constructor() {
      this.nodes = new Map();
    }
  
    addNode(node) {
      if (!this.nodes.has(node)) {
        this.nodes.set(node, new Map());
      }
    }
  
    addEdge(node1, node2, weight) {
      this.nodes.get(node1).set(node2, weight);
      this.nodes.get(node2).set(node1, weight); // Undirected graph
    }
  
    dijkstra(start, end) {
      const distances = new Map();
      const previous = new Map();
      const unvisited = new Set();
  
      // Initialize distances
      this.nodes.forEach((_, node) => {
        distances.set(node, Infinity);
        previous.set(node, null);
        unvisited.add(node);
      });
      distances.set(start, 0);
  
      while (unvisited.size > 0) {
        // Find minimum distance node
        let current = null;
        let minDistance = Infinity;
        unvisited.forEach(node => {
          if (distances.get(node) < minDistance) {
            minDistance = distances.get(node);
            current = node;
          }
        });
  
        if (current === null) break;
        if (current === end) break;
  
        unvisited.delete(current);
  
        // Update distances to neighbors
        this.nodes.get(current).forEach((weight, neighbor) => {
          if (unvisited.has(neighbor)) {
            const newDistance = distances.get(current) + weight;
            if (newDistance < distances.get(neighbor)) {
              distances.set(neighbor, newDistance);
              previous.set(neighbor, current);
            }
          }
        });
      }
  
      // Build path
      const path = [];
      let current = end;
      while (current !== null) {
        path.unshift(current);
        current = previous.get(current);
      }
  
      return {
        path,
        distance: distances.get(end)
      };
    }
  }
  
  export const createMapGraph = () => {
    const graph = new Graph();
  
    // Define all nodes including turns
    const nodes = [
      // Main locations
      "Gate",
      "RB1",
      "RB2",
      "FES",
      "Chapel",
      "Mosque",
      "NitHub",
      "RB1_straight",
      "RB2_straight",
      
      // Turn nodes for FES path
      "FES_Turn1", // Initial turn from main road
      "FES_Turn2", // Turn into FES
      
      // Turn nodes for Chapel path
      "Chapel_Turn1", // Initial turn from main road
      "Chapel_Turn2", // Turn towards Chapel
      "Chapel_Turn3", // Final turn into Chapel
      
      // Turn nodes for Mosque path
      "Mosque_Turn1", // Initial turn from main road
      "Mosque_Turn2", // Turn into Mosque
      
      // Turn nodes for NitHub path
      "NitHub_Turn1", // First turn towards NitHub
      "NitHub_Turn2"  // Final turn into NitHub
    ];
  
    // Add all nodes to the graph
    nodes.forEach(node => graph.addNode(node));
  
    // Add edges with realistic walking distances
    // Main road connections
    graph.addEdge("Gate", "FES_Turn1", 190); // Direct path to FES turn
    graph.addEdge("FES_Turn1", "RB1", 160); // Distance from FES turn to RB1
    graph.addEdge("RB1", "Chapel_Turn1", 20);
    graph.addEdge("Chapel_Turn1", "Mosque_Turn1", 40);
    graph.addEdge("Mosque_Turn1", "RB2", 290);
    graph.addEdge("RB2", "NitHub_Turn1", 150);
    graph.addEdge("NitHub_Turn1", "NitHub_Turn2", 50);
    graph.addEdge("NitHub_Turn2", "NitHub", 100);
  
    // Straight paths from roundabouts
    graph.addEdge("RB1", "RB1_straight", 100);
    graph.addEdge("RB2", "RB2_straight", 100);
  
    // FES path
    graph.addEdge("FES_Turn1", "FES_Turn2", 30);
    graph.addEdge("FES_Turn2", "FES", 30);
  
    // Chapel path
    graph.addEdge("Chapel_Turn1", "Chapel_Turn2", 60);
    graph.addEdge("Chapel_Turn2", "Chapel_Turn3", 20);
    graph.addEdge("Chapel_Turn3", "Chapel", 20);
  
    // Mosque path
    graph.addEdge("Mosque_Turn1", "Mosque_Turn2", 40);
    graph.addEdge("Mosque_Turn2", "Mosque", 40);
  
    // Additional walking shortcuts
    // Allow direct movement between turns without going to roundabout
    graph.addEdge("FES_Turn1", "Chapel_Turn1", 160);
    graph.addEdge("Chapel_Turn1", "Mosque_Turn1", 80);
    graph.addEdge("Mosque_Turn1", "RB2", 290);
    
    // Allow flexible movement near NitHub
    graph.addEdge("NitHub_Turn1", "RB2_straight", 50);
    graph.addEdge("RB2", "NitHub_Turn1", 150);
  
    return graph;
  };