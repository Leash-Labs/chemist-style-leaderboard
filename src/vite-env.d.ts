/// <reference types="vite/client" />

declare module 'smiles-drawer' {
    export interface DrawerOptions {
        width?: number;
        height?: number;
        bondThickness?: number;
        bondLength?: number;
        isomeric?: boolean;
        debug?: boolean;
        terminalCarbons?: boolean;
        explicitHydrogens?: boolean;
        overlapSensitivity?: number;
        overlapResolutionIterations?: number;
        compactDrawing?: boolean;
        fontFamily?: string;
        fontSize?: number;
        fontSizeLarge?: number;
        padding?: number;
        experimental?: boolean;
        themes?: {
            dark?: {
                C?: string;
                O?: string;
                N?: string;
                F?: string;
                CL?: string;
                BR?: string;
                I?: string;
                P?: string;
                S?: string;
                B?: string;
                SI?: string;
                H?: string;
                BACKGROUND?: string;
            };
        };
    }

    export class Drawer {
        constructor(options?: DrawerOptions);
        draw(tree: any, canvasId: string, theme: string, debug?: boolean): void;
    }

    export class SvgDrawer {
        constructor(options?: DrawerOptions);
        draw(tree: any, svgId: string, theme: string): void;
    }

    export function parse(smiles: string, onSuccess: (tree: any) => void, onError: (error: any) => void): void;
}
