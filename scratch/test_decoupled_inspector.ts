import { spawn } from 'child_process';
import path from 'path';

// This script aims to verify if we can spawn the rsmv_inspector context successfully
async function testSubprocess() {
    console.log('Testing decoupled execution of rsmv_inspector...');
    
    // Attempt to invoke the same logic as the working npm start, 
    // but targeted via a simple inspection script.
    const inspectorPath = 'D:\\rsmv_inspector';
    
    // We try to run a small node command inside the inspector folder
    const child = spawn('node', ['-e', 'console.log("Inspector context active:", process.cwd())'], {
        cwd: inspectorPath,
        stdio: 'pipe'
    });

    child.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    child.stderr.on('data', (data) => console.error(`stderr: ${data}`));
    
    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
    });
}

testSubprocess().catch(console.error);
