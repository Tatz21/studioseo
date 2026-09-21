import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Network, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Layers, 
  GitFork, 
  AlertTriangle, 
  Radio,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { 
  SeoMapNode, 
  SeoMapFilterState, 
  DepthFilter, 
  StatusFilter, 
  LayoutMode 
} from '../../map/types';
import { getEnterpriseSeedGraph } from '../../map/graphBuilder';
import { 
  stepForceSimulation, 
  applyRadialConcentricLayout, 
  initializeNodePositions, 
  DEFAULT_SIMULATION_CONFIG 
} from '../../map/graphPhysics';
import { NodeInspectorDrawer } from './NodeInspectorDrawer';

interface SeoMapGraphProps {
  onNavigateToExtractor?: (url: string) => void;
  onNavigateToTechnical?: (url: string) => void;
}

export const SeoMapGraph: React.FC<SeoMapGraphProps> = ({
  onNavigateToExtractor,
  onNavigateToTechnical,
}) => {
  // Graph Data State
  const [graphData, setGraphData] = useState(() => getEnterpriseSeedGraph());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState<SeoMapFilterState>({
    searchQuery: '',
    depth: 'all',
    status: 'all',
    layoutMode: 'force',
  });

  // Camera & Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 0.95 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SeoMapNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simulationActiveRef = useRef(true);

  // Initialize node layout once on mount
  useEffect(() => {
    const container = containerRef.current;
    const width = container ? container.clientWidth : 1200;
    const height = container ? container.clientHeight : 700;
    const cx = width / 2;
    const cy = height / 2;

    initializeNodePositions(graphData.nodes, cx, cy);
    if (filters.layoutMode === 'radial') {
      applyRadialConcentricLayout(graphData.nodes, cx, cy);
    }
    simulationActiveRef.current = true;
  }, []);

  // Filter logic
  const isNodeVisible = useCallback((node: SeoMapNode): boolean => {
    // Depth Filter
    if (filters.depth !== 'all') {
      if (filters.depth === 'deep' && node.depth < 4) return false;
      if (typeof filters.depth === 'number' && node.depth !== filters.depth) return false;
    }

    // Status Filter
    if (filters.status === '200' && node.statusCode !== 200) return false;
    if (filters.status === '3xx' && (node.statusCode < 300 || node.statusCode >= 400)) return false;
    if (filters.status === '4xx' && node.statusCode < 400) return false;
    if (filters.status === 'orphan' && !node.isOrphan) return false;
    if (filters.status === 'low-score' && node.score >= 70) return false;

    return true;
  }, [filters.depth, filters.status]);

  const searchMatchedNodeIds = useMemo(() => {
    if (!filters.searchQuery.trim()) return new Set<string>();
    const query = filters.searchQuery.toLowerCase();
    const matched = new Set<string>();
    for (const node of graphData.nodes) {
      if (node.url.toLowerCase().includes(query) || node.title.toLowerCase().includes(query)) {
        matched.add(node.id);
      }
    }
    return matched;
  }, [filters.searchQuery, graphData.nodes]);

  // Handle Layout Switch
  const handleSwitchLayout = (mode: LayoutMode) => {
    setFilters(prev => ({ ...prev, layoutMode: mode }));
    const container = containerRef.current;
    const cx = container ? container.clientWidth / 2 : 600;
    const cy = container ? container.clientHeight / 2 : 350;

    if (mode === 'radial') {
      applyRadialConcentricLayout(graphData.nodes, cx, cy);
      simulationActiveRef.current = false;
    } else {
      simulationActiveRef.current = true;
    }
  };

  // Center camera on a specific node
  const focusNode = useCallback((nodeId: string) => {
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (!node || !containerRef.current) return;
    setSelectedNodeId(nodeId);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const targetScale = 1.25;

    transformRef.current = {
      x: width / 2 - node.x * targetScale,
      y: height / 2 - node.y * targetScale,
      scale: targetScale,
    };
  }, [graphData.nodes]);

  // Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const container = containerRef.current;
      if (container) {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
        }
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const cx = width / 2;
      const cy = height / 2;

      // Physics step if force mode is active
      if (filters.layoutMode === 'force' && simulationActiveRef.current) {
        const energy = stepForceSimulation(
          graphData.nodes,
          graphData.links,
          cx,
          cy,
          DEFAULT_SIMULATION_CONFIG
        );
        if (energy < DEFAULT_SIMULATION_CONFIG.minEnergyThreshold && !draggedNodeRef.current) {
          simulationActiveRef.current = false;
        }
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Camera Transform
      const { x: tx, y: ty, scale } = transformRef.current;
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      // 1. Draw Background Grid
      const gridSize = 40;
      const startX = Math.floor((-tx / scale) / gridSize) * gridSize - gridSize;
      const endX = startX + (width / scale) + gridSize * 2;
      const startY = Math.floor((-ty / scale) / gridSize) * gridSize - gridSize;
      const endY = startY + (height / scale) + gridSize * 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let gx = startX; gx < endX; gx += gridSize) {
        for (let gy = startY; gy < endY; gy += gridSize) {
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }

      // 2. Draw Radial Rings if in Radial Mode
      if (filters.layoutMode === 'radial') {
        const ringSpacing = 135;
        const rootNode = graphData.nodes.find(n => n.isRoot);
        const rootX = rootNode ? rootNode.x : cx;
        const rootY = rootNode ? rootNode.y : cy;

        for (let d = 1; d <= graphData.stats.maxDepth + 1; d++) {
          const r = d * ringSpacing;
          ctx.beginPath();
          ctx.arc(rootX, rootY, r, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(`CRAWL DEPTH ${d}`, rootX + 10, rootY - r + 14);
        }
      }

      // Node Map for fast link lookup
      const nodeMap = new Map<string, SeoMapNode>();
      for (const n of graphData.nodes) {
        nodeMap.set(n.id, n);
      }

      // Active focus target (hovered or selected)
      const activeHighlightId = hoveredNodeId || selectedNodeId;
      const activeHighlightNode = activeHighlightId ? nodeMap.get(activeHighlightId) : null;
      const connectedNodeIds = new Set<string>();
      if (activeHighlightNode) {
        connectedNodeIds.add(activeHighlightNode.id);
        activeHighlightNode.inlinks.forEach(i => connectedNodeIds.add(i.sourceId));
        activeHighlightNode.outlinks.forEach(o => connectedNodeIds.add(o.targetId));
      }

      // 3. Draw Links / Edges
      for (const link of graphData.links) {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) continue;

        const sourceVisible = isNodeVisible(source);
        const targetVisible = isNodeVisible(target);
        if (!sourceVisible && !targetVisible) continue;

        const isHighlighted = activeHighlightId && 
          (link.source === activeHighlightId || link.target === activeHighlightId);
        const isDimmed = activeHighlightId && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (link.isBroken) {
          ctx.strokeStyle = isDimmed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
          ctx.setLineDash([4, 4]);
        } else if (link.isRedirect) {
          ctx.strokeStyle = isDimmed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.7)';
          ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
          ctx.setLineDash([3, 3]);
        } else if (isHighlighted) {
          ctx.strokeStyle = link.source === activeHighlightId ? 'var(--accent-primary)' : '#06B6D4';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = isDimmed ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.16)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Directional Arrow
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const arrowDist = target.radius + 6;
        const arrowX = target.x - (dx / dist) * arrowDist;
        const arrowY = target.y - (dy / dist) * arrowDist;
        const angle = Math.atan2(dy, dx);
        const arrowSize = isHighlighted ? 6 : 4;

        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-arrowSize * 1.5, -arrowSize);
        ctx.lineTo(-arrowSize * 1.5, arrowSize);
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        ctx.restore();
      }

      // 4. Draw Nodes
      for (const node of graphData.nodes) {
        const isVisible = isNodeVisible(node);
        if (!isVisible) continue;

        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isSearchMatch = searchMatchedNodeIds.has(node.id);
        const isConnected = connectedNodeIds.has(node.id);
        const isDimmed = activeHighlightId && !isSelected && !isHovered && !isConnected && !isSearchMatch;

        const radius = node.radius * (isSelected || isHovered ? 1.25 : 1.0);

        // Node Glow / Halo
        if (isSelected || isHovered || isSearchMatch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 8, 0, 2 * Math.PI);
          ctx.fillStyle = isSearchMatch 
            ? 'rgba(6, 182, 212, 0.35)' 
            : isSelected 
              ? 'rgba(16, 185, 129, 0.4)' 
              : 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
        }

        // Base Node Fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

        if (isDimmed) {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        } else if (node.isOrphan) {
          // Violet for Orphan
          ctx.fillStyle = 'rgba(139, 92, 246, 0.85)';
          ctx.strokeStyle = '#C4B5FD';
        } else if (node.statusCode >= 400) {
          // Red for 4xx Broken
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.strokeStyle = '#FCA5A5';
        } else if (node.statusCode >= 300) {
          // Amber for 3xx Redirect
          ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
          ctx.strokeStyle = '#FCD34D';
        } else if (node.isRoot) {
          // Emerald glow for Root Homepage
          ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
          ctx.strokeStyle = '#6EE7B7';
        } else {
          // 200 OK Standard Node
          ctx.fillStyle = 'rgba(15, 118, 110, 0.85)';
          ctx.strokeStyle = '#34D399';
        }

        ctx.lineWidth = node.isRoot || isSelected ? 3 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Root Node Inner Badge
        if (node.isRoot && !isDimmed) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius - 6, 0, 2 * Math.PI);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Inner Letter Grade / Score text inside node
        if (radius >= 16 && !isDimmed) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.isRoot ? 'ROOT' : `${node.score}`, node.x, node.y);
        }

        // Node Label (Page Path or Title)
        const showLabel = isSelected || isHovered || isSearchMatch || scale > 0.85 || node.depth <= 1;
        if (showLabel) {
          const label = node.path === '/' ? '/' : (node.path.split('/').pop() || node.path);
          ctx.font = isSelected || isHovered 
            ? 'bold 11px Inter, sans-serif' 
            : '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          // Background pill behind text for legibility
          const textMetrics = ctx.measureText(label);
          const bgPadding = 4;
          const labelY = node.y + radius + 4;

          ctx.fillStyle = isDimmed ? 'rgba(11, 15, 23, 0.6)' : 'rgba(11, 15, 23, 0.85)';
          ctx.fillRect(
            node.x - textMetrics.width / 2 - bgPadding,
            labelY - 1,
            textMetrics.width + bgPadding * 2,
            15
          );

          ctx.fillStyle = isDimmed 
            ? 'rgba(255, 255, 255, 0.3)' 
            : isSelected || isHovered 
              ? '#FFFFFF' 
              : 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(label, node.x, labelY);
        }
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    graphData, 
    filters.layoutMode, 
    isNodeVisible, 
    selectedNodeId, 
    hoveredNodeId, 
    searchMatchedNodeIds
  ]);

  // Canvas Mouse Event Handlers (Pan, Zoom, Drag Node, Click)
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { x: tx, y: ty, scale } = transformRef.current;
    return {
      x: (x - tx) / scale,
      y: (y - ty) / scale,
    };
  };

  const findNodeAtCoords = (wx: number, wy: number): SeoMapNode | null => {
    // Search in reverse order (top nodes first)
    for (let i = graphData.nodes.length - 1; i >= 0; i--) {
      const node = graphData.nodes[i];
      if (!isNodeVisible(node)) continue;
      const dx = wx - node.x;
      const dy = wy - node.y;
      if (dx * dx + dy * dy <= (node.radius + 5) * (node.radius + 5)) {
        return node;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const clickedNode = findNodeAtCoords(coords.x, coords.y);

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      clickedNode.isPinned = true;
      simulationActiveRef.current = true;
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);

    // Node Dragging
    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = coords.x;
      draggedNodeRef.current.y = coords.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      simulationActiveRef.current = true;
      return;
    }

    // Canvas Background Panning
    if (isDraggingRef.current) {
      transformRef.current.x = e.clientX - dragStartRef.current.x;
      transformRef.current.y = e.clientY - dragStartRef.current.y;
      return;
    }

    // Node Hovering
    const hovered = findNodeAtCoords(coords.x, coords.y);
    setHoveredNodeId(hovered ? hovered.id : null);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.isPinned = false;
      draggedNodeRef.current = null;
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }

    // Click Detection (no significant movement)
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const clickedNode = findNodeAtCoords(coords.x, coords.y);
    if (clickedNode) {
      setSelectedNodeId(clickedNode.id);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(3.0, Math.max(0.3, transformRef.current.scale * zoomFactor));

    // Zoom centered at cursor point
    const { x: tx, y: ty, scale: curScale } = transformRef.current;
    const wx = (mouseX - tx) / curScale;
    const wy = (mouseY - ty) / curScale;

    transformRef.current = {
      x: mouseX - wx * newScale,
      y: mouseY - wy * newScale,
      scale: newScale,
    };
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.25 : 0.8;
    const container = containerRef.current;
    const width = container ? container.clientWidth : 1000;
    const height = container ? container.clientHeight : 600;
    const cx = width / 2;
    const cy = height / 2;

    const cur = transformRef.current;
    const newScale = Math.min(3.0, Math.max(0.3, cur.scale * factor));
    const wx = (cx - cur.x) / cur.scale;
    const wy = (cy - cur.y) / cur.scale;

    transformRef.current = {
      x: cx - wx * newScale,
      y: cy - wy * newScale,
      scale: newScale,
    };
  };

  const handleResetView = () => {
    const container = containerRef.current;
    const width = container ? container.clientWidth : 1000;
    const height = container ? container.clientHeight : 600;
    const cx = width / 2;
    const cy = height / 2;

    const freshGraph = getEnterpriseSeedGraph();
    initializeNodePositions(freshGraph.nodes, cx, cy);
    if (filters.layoutMode === 'radial') {
      applyRadialConcentricLayout(freshGraph.nodes, cx, cy);
    }
    setGraphData(freshGraph);
    setSelectedNodeId(null);
    simulationActiveRef.current = true;

    transformRef.current = {
      x: width * 0.05,
      y: height * 0.05,
      scale: 0.9,
    };
  };

  const handleFitToScreen = () => {
    const container = containerRef.current;
    if (!container || graphData.nodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const node of graphData.nodes) {
      minX = Math.min(minX, node.x - node.radius);
      maxX = Math.max(maxX, node.x + node.radius);
      minY = Math.min(minY, node.y - node.radius);
      maxY = Math.max(maxY, node.y + node.radius);
    }

    const graphWidth = maxX - minX + 100;
    const graphHeight = maxY - minY + 100;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scale = Math.min(
      containerWidth / graphWidth,
      containerHeight / graphHeight,
      1.2
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    transformRef.current = {
      x: containerWidth / 2 - centerX * scale,
      y: containerHeight / 2 - centerY * scale,
      scale: Math.max(0.4, scale),
    };
  };

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graphData.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData.nodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', position: 'relative' }}>
      {/* 1. Header Metrics Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.85rem'
      }}>
        <div className="card" style={{ padding: '0.85rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Mapped Pages</span>
            <Network size={16} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {graphData.stats.totalPages}
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Internal Hyperlinks</span>
            <GitFork size={16} color="#06B6D4" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {graphData.stats.totalLinks}
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Max Crawl Depth</span>
            <Layers size={16} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {graphData.stats.maxDepth} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>tiers</span>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Page Depth</span>
            <Radio size={16} color="#06B6D4" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {graphData.stats.avgDepth} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>clicks</span>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem', borderLeft: '3px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Orphan Pages</span>
            <AlertTriangle size={16} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C4B5FD', marginTop: '0.35rem' }}>
            {graphData.stats.orphanCount}
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.15rem', borderLeft: '3px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Broken Links (404)</span>
            <AlertTriangle size={16} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FCA5A5', marginTop: '0.35rem' }}>
            {graphData.stats.brokenLinksCount}
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="card" style={{
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Left: Search & Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search URL or title..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.825rem'
              }}
            />
          </div>

          {/* Depth Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.03)', padding: '3px', borderRadius: '8px' }}>
            {(['all', 0, 1, 2, 3, 'deep'] as DepthFilter[]).map((d) => (
              <button
                key={String(d)}
                onClick={() => setFilters(prev => ({ ...prev, depth: d }))}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  background: filters.depth === d ? 'var(--accent-primary)' : 'transparent',
                  color: filters.depth === d ? '#042F2E' : 'var(--text-secondary)',
                  fontWeight: filters.depth === d ? 700 : 400,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {d === 'all' ? 'All Depths' : d === 'deep' ? 'Depth 4+' : `D${d}`}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SlidersHorizontal size={14} color="var(--text-muted)" />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as StatusFilter }))}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All HTTP Statuses</option>
              <option value="200">200 OK Only</option>
              <option value="3xx">3xx Redirects</option>
              <option value="4xx">4xx Broken Links</option>
              <option value="orphan">Orphan Pages</option>
              <option value="low-score">Low Score (&lt;70)</option>
            </select>
          </div>
        </div>

        {/* Right: Layout Switcher & Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Layout Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => handleSwitchLayout('force')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                background: filters.layoutMode === 'force' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: filters.layoutMode === 'force' ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: filters.layoutMode === 'force' ? 600 : 400
              }}
            >
              Force Cluster
            </button>
            <button
              onClick={() => handleSwitchLayout('radial')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                background: filters.layoutMode === 'radial' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: filters.layoutMode === 'radial' ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: filters.layoutMode === 'radial' ? 600 : 400
              }}
            >
              Radial Tree
            </button>
          </div>

          <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />

          {/* Zoom Buttons */}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              onClick={() => handleZoom('in')}
              className="btn btn-secondary"
              title="Zoom In"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="btn btn-secondary"
              title="Zoom Out"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={handleFitToScreen}
              className="btn btn-secondary"
              title="Fit to Screen"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
            >
              <Maximize2 size={15} />
            </button>
            <button
              onClick={handleResetView}
              className="btn btn-secondary"
              title="Reset Camera"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Interactive Canvas Container */}
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '680px',
          background: 'radial-gradient(ellipse at center, rgba(16, 24, 39, 0.9) 0%, rgba(11, 15, 23, 0.98) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', display: 'block' }} 
        />

        {/* Legend Overlay Bottom Left */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(11, 15, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={13} />
            <span>Map Node Legend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>200 OK (Healthy)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span>301/302 Redirect</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span>404 Broken Page</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8B5CF6', display: 'inline-block' }} />
            <span>Orphan (0 Inlinks)</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            * Node size proportional to inlink PageRank equity
          </div>
        </div>

        {/* Quick Instructions Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(11, 15, 23, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.5rem 0.85rem',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}>
          Scroll to zoom • Drag background to pan • Click node to inspect
        </div>
      </div>

      {/* 4. Slide-Over Node Inspector Drawer */}
      {selectedNode && (
        <NodeInspectorDrawer
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onSelectNode={(nodeId) => focusNode(nodeId)}
          onNavigateToExtractor={onNavigateToExtractor}
          onNavigateToTechnical={onNavigateToTechnical}
        />
      )}
    </div>
  );
};
