import React, {useEffect, useRef, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {RotateCcw} from 'lucide-react';

const NetworkGraph = () => {
    const [nodes] = useState([
        // Community 1
        {id: 1, name: 'Ali Mohammadi', community: 1, connections: [2, 3, 4, 5, 9]},
        {id: 2, name: 'Shaswati Saha', community: 1, connections: [1, 3, 4, 8]},
        {id: 3, name: 'Nilanjana Das', community: 1, connections: [1, 2, 4, 5]},
        {id: 4, name: 'Yash Saxena', community: 1, connections: [1, 2, 3, 5]},
        {id: 5, name: 'Saksham Sharma', community: 1, connections: [1, 3, 4, 9]},
        // Community 2
        {id: 6, name: 'Ben Lagnese', community: 2, connections: [7, 8, 9]},
        {id: 7, name: 'Sriram Vema', community: 2, connections: [6, 8, 9]},
        {id: 8, name: 'Seyedreza Mohseni', community: 2, connections: [2, 6, 7, 9]},
        {id: 9, name: 'Sarvesh Baskar', community: 2, connections: [1, 5, 6, 7, 8]},
        // Community 3
        {id: 10, name: 'Gerald Ndawula', community: 3, connections: [6, 7, 11, 12]},
        {id: 11, name: 'Priyanshul Govil', community: 3, connections: [7, 8, 10, 12]},
        {id: 12, name: 'Mathew Dawit', community: 3, connections: [10, 11, 6, 13]},
        {id: 13, name: 'Vamshi Bonagiri', community: 3, connections: [10, 11, 6, 8]}
    ]);

    const communityColors = {
        1: '#E09891',
        2: '#0090C1',
        3: '#E8F1F2'
    };

    const [positions, setPositions] = useState({});
    const [initialPositions, setInitialPositions] = useState({});
    const [hoveredNode, setHoveredNode] = useState(null);
    const [draggedNode, setDraggedNode] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const svgRef = useRef(null);
    const nodeRefs = useRef({});
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);
    const startPositionsRef = useRef({});
    const targetPositionsRef = useRef({});

    const calculatePositions = () => {
        const newPositions = {};

        // Community 1 - Inner circle
        const radius1 = 100;
        const community1Nodes = nodes.filter(n => n.community === 1);
        const angleStep1 = (2 * Math.PI) / community1Nodes.length;

        community1Nodes.forEach((node, index) => {
            const angle = index * angleStep1;
            newPositions[node.id] = {
                x: radius1 * Math.cos(angle) + 200,
                y: radius1 * Math.sin(angle) + 180
            };
        });

        // Outer circle for Communities 2 and 3
        const radius2 = 180;
        const outerNodes = nodes.filter(n => n.community !== 1);
        const angleStep2 = (2 * Math.PI) / outerNodes.length;

        outerNodes.forEach((node, index) => {
            const angle = index * angleStep2 + (Math.PI / outerNodes.length);
            newPositions[node.id] = {
                x: radius2 * Math.cos(angle) + 200,
                y: radius2 * Math.sin(angle) + 180
            };
        });

        return newPositions;
    };

    useEffect(() => {
        const newPositions = calculatePositions();
        setPositions(newPositions);
        setInitialPositions(newPositions);
    }, [nodes]);

    const animateToPositions = (targetPositions) => {
        // Store current positions as starting point
        startPositionsRef.current = {...positions};
        // Store target positions
        targetPositionsRef.current = targetPositions;

        // Start animation
        setIsAnimating(true);
        startTimeRef.current = Date.now();

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTimeRef.current;
            const duration = 800; // ms

            if (elapsed < duration) {
                // Calculate progress (0 to 1)
                const progress = elapsed / duration;
                // Use ease-out function
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

                // Interpolate positions
                const newPositions = {};
                for (const nodeId in startPositionsRef.current) {
                    const start = startPositionsRef.current[nodeId];
                    const target = targetPositionsRef.current[nodeId];

                    newPositions[nodeId] = {
                        x: start.x + (target.x - start.x) * easeProgress,
                        y: start.y + (target.y - start.y) * easeProgress
                    };
                }

                setPositions(newPositions);
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Finish animation exactly at target positions
                setPositions(targetPositionsRef.current);
                setIsAnimating(false);
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    // Clean up animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const handleReset = () => {
        if (isAnimating) return;
        animateToPositions(initialPositions);
    };

    const getSVGCoordinates = (event) => {
        const svg = svgRef.current;
        if (!svg) return {x: 0, y: 0};

        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;

        const CTM = svg.getScreenCTM();
        if (!CTM) return {x: 0, y: 0};

        const svgPoint = point.matrixTransform(CTM.inverse());
        return {x: svgPoint.x, y: svgPoint.y};
    };

    const handleMouseDown = (nodeId, event) => {
        if (isAnimating) return; // Prevent dragging during animation
        event.preventDefault();
        setDraggedNode({
            id: nodeId,
            offset: {
                x: positions[nodeId].x - getSVGCoordinates(event).x,
                y: positions[nodeId].y - getSVGCoordinates(event).y
            }
        });
    };

    const handleMouseMove = (event) => {
        if (!draggedNode || isAnimating) return;

        const coords = getSVGCoordinates(event);
        setPositions(prev => ({
            ...prev,
            [draggedNode.id]: {
                x: coords.x + draggedNode.offset.x,
                y: coords.y + draggedNode.offset.y
            }
        }));
    };

    const handleMouseUp = () => {
        setDraggedNode(null);
    };

    const renderEdges = () => {
        const edges = [];
        nodes.forEach(node => {
            node.connections.forEach(targetId => {
                if (node.id < targetId) { // Prevent duplicate edges
                    const start = positions[node.id];
                    const end = positions[targetId];
                    if (start && end) {
                        const isCrossCommunity =
                            nodes.find(n => n.id === targetId)?.community !== node.community;

                        edges.push(
                            <line
                                key={`${node.id}-${targetId}`}
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                className={`${
                                    isCrossCommunity ? 'stroke-purple-300' : 'stroke-gray-300'
                                } ${
                                    hoveredNode === node.id || hoveredNode === targetId
                                        ? 'stroke-2 opacity-100'
                                        : 'stroke-1 opacity-50'
                                }`}
                            />
                        );
                    }
                }
            });
        });
        return edges;
    };

    const renderNodes = () => {
        return nodes.map(node => {
            const pos = positions[node.id];
            if (!pos) return null;

            return (
                <g
                    key={node.id}
                    ref={el => nodeRefs.current[node.id] = el}
                    transform={`translate(${pos.x},${pos.y})`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onMouseDown={(e) => handleMouseDown(node.id, e)}
                    className="cursor-move"
                >
                    <circle
                        r={hoveredNode === node.id ? 25 : 20}
                        fill={communityColors[node.community]}
                        className={`${
                            hoveredNode === node.id
                                ? 'opacity-100'
                                : 'opacity-80'
                        } transition-all duration-200`}
                    />
                    <text
                        className="text-xs fill-black font-medium pointer-events-none"
                        textAnchor="middle"
                        dy=".3em"
                    >
                        {node.name.split(' ').map(part => part[0]).join('')}
                    </text>
                    {hoveredNode === node.id && (
                        <g className="pointer-events-none">
                            <rect
                                x="-60"
                                y="-45"
                                width="120"
                                height="25"
                                rx="4"
                                className="fill-white opacity-90"
                            />
                            <text
                                className="text-xs fill-gray-700 font-medium"
                                textAnchor="middle"
                                dy="-30"
                            >
                                {node.name}
                            </text>
                        </g>
                    )}
                </g>
            );
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Network Graph</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-square">
                        <svg
                            ref={svgRef}
                            viewBox="0 0 400 360"
                            className="w-full h-full"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {renderEdges()}
                            {renderNodes()}
                        </svg>
                    </div>
                    <button
                        onClick={handleReset}
                        className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isAnimating}
                    >
                        <RotateCcw className="w-4 h-4 mr-2"/>
                        Reset Layout
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};

export default NetworkGraph;