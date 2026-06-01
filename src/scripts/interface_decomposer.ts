import { allParsers } from "../rsmv/opdecoder.js";
import type { RSInterfaceManifest, RSInterfaceComponent } from "../../mediator/app/components/InterfaceViewport.js";

export async function decomposeInterface(interfaceId: number, archiveData: { fileid: number, buffer: Uint8Array }[]): Promise<RSInterfaceManifest> {
    const components: RSInterfaceComponent[] = [];
    const textLabels: string[] = [];

    for (const file of archiveData) {
        try {
            const rawComp = allParsers.interfaces.read(file.buffer, {
                getDecodeArgs: () => ({ clientVersion: 940 }) // Default to recent RS3
            });

            const typeMap: Record<number, string> = {
                0: "CONTAINER",
                3: "FIGURE",
                4: "TEXT",
                5: "SPRITE",
                6: "MODEL",
                9: "LINE",
                10: "TYPE_10"
            };

            const comp: RSInterfaceComponent = {
                componentId: file.fileid,
                type: typeMap[rawComp.type] || `UNKNOWN_${rawComp.type}`,
                typeId: rawComp.type,
                position: { x: rawComp.baseposx, y: rawComp.baseposy },
                dimensions: { w: rawComp.basewidth, h: rawComp.baseheight },
                parentId: rawComp.parentid,
                hidden: rawComp.hidden !== 0
            };

            if (rawComp.textdata) {
                comp.text = rawComp.textdata.text;
                textLabels.push(rawComp.textdata.text);
            }

            if (rawComp.spritedata) {
                comp.spriteId = rawComp.spritedata.spriteid;
            }

            if (rawComp.figuredata) {
                comp.color = rawComp.figuredata.color;
            }

            components.push(comp);
        } catch (e) {
            console.error(`Failed to parse component ${file.fileid} in interface ${interfaceId}:`, e);
        }
    }

    return {
        interfaceId,
        totalComponents: components.length,
        components,
        textLabels: [...new Set(textLabels)]
    };
}

