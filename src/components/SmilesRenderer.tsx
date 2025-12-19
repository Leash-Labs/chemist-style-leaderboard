import React, { useRef, useEffect } from "react";
import SmilesDrawer from "smiles-drawer";

interface SmilesRendererProps {
    smiles: string;
    width?: number;
    height?: number;
    className?: string;
}

export default function SmilesRenderer({
    smiles,
    width = 200,
    height = 200,
    className = ''
}: SmilesRendererProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    const SETTINGS = {
        width: width,
        height: height,
        bondThickness: 1.6,
        bondLength: 17,
        isomeric: true,
        debug: false,
        terminalCarbons: false,
        explicitHydrogens: false,
        overlapSensitivity: 0.42,
        overlapResolutionIterations: 1,
        compactDrawing: false,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 6,
        fontSizeLarge: 8,
        padding: 4.0,
        experimental: false,
        themes: {
            light: {
                C: '#111827',
                O: '#e74c3c',
                N: '#1f77b4',
                F: '#27ae60',
                CL: '#16a085',
                BR: '#d35400',
                I: '#8e44ad',
                P: '#f39c12',
                S: '#f1c40f',
                B: '#e67e22',
                SI: '#6b7280',
                H: '#9ca3af',
                BACKGROUND: '#ffffff'
            }
        }
    };

    useEffect(() => {
        if (!smiles || !svgRef.current) {
            return;
        }

        // Add a small delay to ensure the SVG is fully rendered in the DOM
        const timer = setTimeout(() => {
            try {
                // Use SvgDrawer directly to avoid the bug in Drawer class
                const drawer = new SmilesDrawer.SvgDrawer(SETTINGS);

                // Parse the SMILES string and draw it
                SmilesDrawer.parse(smiles, function (tree: any) {
                    if (svgRef.current) {
                        drawer.draw(tree, svgRef.current.id, "light");
                    }
                }, function (err: any) {
                    console.error('Error parsing SMILES:', err);
                });

            } catch (error) {
                console.error('Error in SmilesRenderer:', error);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [smiles, width, height]);

    return (
        <div
            className={`mol ${className}`}
            style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                width: width,
                height: height
            }}
        >
            {smiles ? (
                <svg
                    ref={svgRef}
                    id={`smiles-svg-${Math.random().toString(36).substr(2, 9)}`}
                    width={width}
                    height={height}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ffffff'
                    }}
                >
                    <title>{smiles}</title>
                </svg>
            ) : (
                <div style={{
                    display: 'grid',
                    placeItems: 'center',
                    height: '100%',
                    color: 'var(--muted)',
                    fontSize: '12px'
                }}>
                    No SMILES
                </div>
            )}
        </div>
    );
}
