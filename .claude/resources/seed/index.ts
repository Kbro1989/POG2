/**
 * Seed data system — creates the "Examples" project with pre-built
 * conversations and artifacts so users see demo content on first launch.
 *
 * Triggered lazily by adapters before the first projects.list call.
 */

export {
  seedAllExamples,
  seedExampleProject,
  EXAMPLE_PROJECT_ID,
  seedExampleExtremophile,
  seedExampleEnzymeEngineering,
  seedExampleCrisprScreen,
  seedExampleImmunotherapy,
} from "./example.js";
