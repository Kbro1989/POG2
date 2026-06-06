import React, { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { SovereignBridge } from './SovereignBridge';

interface EntityHUDData {
    name: string;
    type: 'npc' | 'object' | 'loc';
    sovereignId: string;
    stats: {
        requirements?: Record<string, number>;
        combat?: number;
        level?: number;
    };
    actionables: string[];
}

/**
 * SovereignTrainingHUD
 *
 * The Semantic Layer of the Sovereign Training Ground.
 * Renders floating, pedagogy-enriched labels for entities.
 */
export const SovereignTrainingHUD: React.FC = () => {
    const [hoveredEntity, setHoveredEntity] = useState<EntityHUDData | null>(null);
    const [overlayElement, setOverlayElement] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        // Initialize CSS2D Renderer for the HUD
        const scene = (window as any).rsmvScene; // Assume scene is exposed globally by rsmv_inspector
        if (!scene) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(labelRenderer.domElement);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event: MouseEvent) => {
            mouse.x = (event.clientX / width) * 2 - 1;
            mouse.y = -(event.clientY / height) * 2 + 1;

            raycaster.setFromCamera(mouse, (window as any).rsmvCamera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const obj = intersects[0].object;
                // The SovereignObjectRenderer tags meshes with a unique key like "LOC_123"
                const idMatch = obj.name?.match(/LOC_(\d+)|NPC_(\d+)/);
                if (idMatch) {
                    const entityId = idMatch[1] || idMatch[2];
                    fetchSovereignData(entityId);
                }
            } else {
                setHoveredEntity(null);
            }
        };

        window.addEventListener('mousemove', onMouseMove);

        // Animation loop for HUD labels
        const animate = () => {
            labelRenderer.render((window as any).rsmvScene, (window as any).rsmvCamera);
            requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.body.removeChild(labelRenderer.domElement);
        };
    }, []);

    const fetchSovereignData = async (entityId: string) => {
        // Request pedagogy-enriched data via the Sovereign Bridge
        const bridge = SovereignBridge.getInstance();

        // We send a REQUEST_PEDAGOGY signal to the server
        bridge.send({
            type: 'REQUEST_PEDAGOGY',
            entityId: entityId,
            context: 'HUD_HOVER'
        });

        // The response comes back via the ENTITY channel
        // We'll listen for it in a separate useEffect or via a bridge callback
    };

    // Handle incoming ENTITY packets from SovereignBridge
    useEffect(() => {
        const bridge = SovereignBridge.getInstance();
        bridge.on('ENTITY_DATA', (data: EntityHUDData) => {
            setHoveredEntity(data);
        });
    }, []);

    if (!hoveredEntity) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#00ffff',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            border: '1px solid #00ffff',
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '250px'
        }}>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '5px' }}>
                {hoveredEntity.name}
            </div>
            <div style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '10px' }}>
                ID: {hoveredEntity.sovereignId} | Type: {hoveredEntity.type.toUpperCase()}
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.9em', color: '#fff' }}>
                    <strong>Pedagogy Grounding:</strong>
                </div>
                {hoveredEntity.stats.requirements && Object.entries(hoveredEntity.stats.requirements).map(([skill, level]) => (
                    <div key={skill} style={{ fontSize: '0.8em' }}>
                        {skill}: {level}
                    </div>
                ))}
                {hoveredEntity.stats.combat && (
                    <div style={{ fontSize: '0.8em' }}>Combat Rating: {hoveredEntity.stats.combat}</div>
                )}
            </div>

            <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {hoveredEntity.actionables.map(act => (
                    <span key={act} style={{
                        backgroundColor: '#004444',
                        padding: '2px 6px',
                        fontSize: '0.7em',
                        borderRadius: '4px',
                        border: '1px solid #00ffff'
                    }}>
                        {act}
                    </span>
                ))}
            </div>
        </div>
    );
};
