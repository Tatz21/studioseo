import { SeoMapNode, SeoMapLink } from './types';

export interface SimulationConfig {
  repulsionStrength: number;
  springStrength: number;
  springLength: number;
  centerStrength: number;
  damping: number;
  minEnergyThreshold: number;
}

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  repulsionStrength: 2800,
  springStrength: 0.04,
  springLength: 120,
  centerStrength: 0.02,
  damping: 0.88,
  minEnergyThreshold: 0.05,
};

/**
 * Initializes nodes with random or radial coordinates around center
 */
export function initializeNodePositions(
  nodes: SeoMapNode[],
  centerX: number,
  centerY: number,
  radiusSpread: number = 320
): void {
  nodes.forEach((node, index) => {
    if (node.isRoot) {
      node.x = centerX;
      node.y = centerY;
      node.vx = 0;
      node.vy = 0;
      return;
    }

    const angle = (index / nodes.length) * 2 * Math.PI + (Math.random() * 0.2 - 0.1);
    const r = Math.min(radiusSpread, 70 + node.depth * 65) + (Math.random() * 30 - 15);
    node.x = centerX + Math.cos(angle) * r;
    node.y = centerY + Math.sin(angle) * r;
    node.vx = 0;
    node.vy = 0;
  });
}

/**
 * Executes a single step of the force-directed simulation using Velocity Verlet.
 * Returns total kinetic energy (used to determine if simulation should sleep).
 */
export function stepForceSimulation(
  nodes: SeoMapNode[],
  links: SeoMapLink[],
  centerX: number,
  centerY: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): number {
  const nodeMap = new Map<string, SeoMapNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // 1. Coulomb-like Node Repulsion (O(N^2), highly efficient for N < 300)
  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distSq = dx * dx + dy * dy || 1;
      const dist = Math.sqrt(distSq);

      // Desired minimum distance between node boundaries
      const minDist = nodeA.radius + nodeB.radius + 15;
      const effectiveDist = Math.max(dist, minDist);

      const force = config.repulsionStrength / (effectiveDist * effectiveDist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!nodeA.isPinned) {
        nodeA.vx -= fx;
        nodeA.vy -= fy;
      }
      if (!nodeB.isPinned) {
        nodeB.vx += fx;
        nodeB.vy += fy;
      }
    }
  }

  // 2. Hooke's Law Spring Attraction along Links
  for (const link of links) {
    const source = nodeMap.get(link.source);
    const target = nodeMap.get(link.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const displacement = dist - config.springLength;
    const force = displacement * config.springStrength;

    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!source.isPinned) {
      source.vx += fx;
      source.vy += fy;
    }
    if (!target.isPinned) {
      target.vx -= fx;
      target.vy -= fy;
    }
  }

  // 3. Center Gravity & Velocity Update
  let totalEnergy = 0;

  for (const node of nodes) {
    if (node.isPinned) {
      node.vx = 0;
      node.vy = 0;
      continue;
    }

    // Pull toward canvas center
    const dcx = centerX - node.x;
    const dcy = centerY - node.y;
    node.vx += dcx * config.centerStrength;
    node.vy += dcy * config.centerStrength;

    // Apply damping friction
    node.vx *= config.damping;
    node.vy *= config.damping;

    // Cap maximum speed for stability
    const maxSpeed = 18;
    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > maxSpeed) {
      node.vx = (node.vx / speed) * maxSpeed;
      node.vy = (node.vy / speed) * maxSpeed;
    }

    // Position update
    node.x += node.vx;
    node.y += node.vy;

    totalEnergy += speed;
  }

  return totalEnergy;
}

/**
 * Computes exact target positions for Radial Concentric Depth Layout
 * Concentric rings: Depth 0 at center, Depth 1 at R1, Depth 2 at R2...
 */
export function applyRadialConcentricLayout(
  nodes: SeoMapNode[],
  centerX: number,
  centerY: number,
  ringSpacing: number = 135
): void {
  // Group nodes by depth
  const depthGroups = new Map<number, SeoMapNode[]>();
  const orphans: SeoMapNode[] = [];

  for (const node of nodes) {
    if (node.isOrphan) {
      orphans.push(node);
      continue;
    }
    const current = depthGroups.get(node.depth) || [];
    current.push(node);
    depthGroups.set(node.depth, current);
  }

  // Place root at center
  const rootGroup = depthGroups.get(0) || [];
  for (const root of rootGroup) {
    root.x = centerX;
    root.y = centerY;
    root.vx = 0;
    root.vy = 0;
  }

  // Place concentric rings
  depthGroups.forEach((tierNodes, depth) => {
    if (depth === 0) return;
    const radius = depth * ringSpacing;
    const count = tierNodes.length;

    tierNodes.forEach((node, index) => {
      // Offset starting angle per depth to prevent radial overlap
      const angleOffset = (depth % 2) * (Math.PI / count);
      const angle = (index / count) * 2 * Math.PI + angleOffset;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
      node.vx = 0;
      node.vy = 0;
    });
  });

  // Place orphans in an outer upper-right cluster
  orphans.forEach((node, index) => {
    const orphanRadius = (Math.max(3, depthGroups.size) + 0.8) * ringSpacing;
    const angle = -Math.PI / 4 + (index - (orphans.length - 1) / 2) * 0.25;
    node.x = centerX + Math.cos(angle) * orphanRadius;
    node.y = centerY + Math.sin(angle) * orphanRadius;
    node.vx = 0;
    node.vy = 0;
  });
}
