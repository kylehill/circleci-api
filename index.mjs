import { getAllPipelines } from "./queries/getPipelines.mjs";
import { getAllWorkflows } from "./queries/getWorkflows.mjs";
import { getAllJobs } from "./queries/getJobs.mjs";
import { getAllFailedTests } from "./queries/getTests.mjs";
import env from "./env.mjs";

// Nouns are confusing here and the CircleCI API documentation doesn't do a great
// job of disambuigation, so I'll do my best to add comments on what *I* call things.
const main = async () => {
  // A "pipeline" is one of more iterations of a build chain, ideally producing a build.
  // nb: 90 days takes a _while_ to run. You might want to choose ~10 days if you're
  // just testing that this is set up correctly.
  const pipelines = await getAllPipelines(env.days);
  console.log(`Found ${pipelines.length} pipelines`);

  // A "workflow" is a single iteration of a build chain. Workflows can be re-run
  // within the same pipeline, which is why we need to flatten them out.
  const workflows = await getAllWorkflows(pipelines.map((p) => p.id));

  /*
   * Workflows can have the following statuses:
   *  - "success": The build succeeded and (for us) we pushed it to prod
   *  - "on hold": For us, the build succeeded, but we didn't push that one to prod
   *  - "failed": Some step in the build failed
   *  - "canceled": The build was manually stopped for some reason by a Trussel
   *  - "running": Still in progress
   *
   * We want to ignore builds in the last two tranches for data integrity reasons.
   */
  const uncanceledWorkflows = workflows.filter(
    (w) => !(w.status === "canceled" || w.status === "running")
  );
  console.log(
    `Retrieved ${uncanceledWorkflows.length} (uncancelled) workflows`
  );

  // There are many jobs within a workflow -- you might also call them "steps," but
  // the CircleCI API documentation calls them jobs. "intergration_tests" is a job.
  const workflowJobs = await getAllJobs(uncanceledWorkflows.map((w) => w.id));
  console.log(`Retrieved ${workflowJobs.length} workflow job specs`);

  // If a workflow is manually "re-run from failed," result any passing jobs
  // will be re-used without being run again. We want to only count unique
  // "integration_tests" jobs in case something else failed and needed to be re-run
  const integrationTestJobNumbers = [
    ...workflowJobs.reduce((mem, job) => {
      if (job.integration_tests_admin?.number) {
        mem.add(job.integration_tests_admin.number);
      }
      if (job.integration_tests_milmove?.number) {
        mem.add(job.integration_tests_milmove.number);
      }
      if (job.integration_tests_mtls?.number) {
        mem.add(job.integration_tests_mtls.number);
      }
      if (job.integration_tests_mymove?.number) {
        mem.add(job.integration_tests_mymove.number);
      }
      if (job.integration_tests_office?.number) {
        mem.add(job.integration_tests_office.number);
      }
      return mem;
    }, new Set()),
  ];
  console.log(
    `Found ${integrationTestJobNumbers.length} integration test runs`
  );

  // Individual test failures are things we're trying to find out about.
  // These correspond to `it("test name")` in Cypress tests for us.
  const failedTests = await getAllFailedTests(integrationTestJobNumbers);

  // Finally, console.log out the failing tests, in order.
  const sorted = Object.values(failedTests).sort((a, b) => {
    return b.count - a.count;
  });
  sorted.map((test) => {
    console.log(`${test.count.toString().padStart(5, " ")} | ${test.name}`);
    console.log(`      | ${test.message}`);
    console.log(`      |`);
  });
};

// We need to do this two-step process so we can get into an async context.
main();
