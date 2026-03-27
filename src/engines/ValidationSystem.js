import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from "../utils/logger.js";
const execAsync = promisify(exec);
const logger = createLogger('ValidationSystem');
/**
 * ValidationSystem - Orchestrates the execution of multiple code validators.
 */
export class ValidationSystem {
    validators = [];
    constructor(validators = []) {
        this.validators = validators;
    }
    addValidator(validator) {
        this.validators.push(validator);
    }
    async validateAll(output, context) {
        for (const validator of this.validators) {
            const result = await validator.validate(output, context);
            if (!result.ok)
                return result;
        }
        return { ok: true, value: true };
    }
    async runProcessValidation(projectRoot) {
        logger.info({ projectRoot }, 'Running process-level validation (npm run typecheck)');
        try {
            await execAsync('npm run build', { cwd: projectRoot, timeout: 60000 });
            return { ok: true, value: true };
        }
        catch (error) {
            const out = error.stdout || error.message || 'Build failed';
            return {
                ok: false,
                error: {
                    reason: 'TS/Build Validation Failed',
                    suggestion: out.substring(0, 500)
                }
            };
        }
    }
    healthCheck() {
        return { online: true, details: `ValidationSystem active with ${this.validators.length} validators.` };
    }
}
