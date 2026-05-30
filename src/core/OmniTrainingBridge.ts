/**
 * OmniTrainingBridge — Mandatory interface for all Sovereign Limbs
 * providing data for the POG2 cognitive substrate.
 */

import { LearningEvent } from './models.js';

export interface OmniTrainingBridge {
    /**
     * distill — Converts raw limb activity into a standardized LearningEvent.
     * Must be implemented by all limbs that contribute to system training.
     */
    distill(event: any): LearningEvent;

    /**
     * getDomainNamespace — Identifies the limb's domain for training classification.
     */
    getDomainNamespace(): string;
}
