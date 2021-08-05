import customFetch from "../customFetch.mjs";

export const getAllFailedTests = async (jobNumbers) => {
  let testResults = [];

  for (let idx = 0; idx < jobNumbers.length; idx++) {
    const jobNumber = jobNumbers[idx];
    const result = await getFailedTests(jobNumber);
    testResults.push(result);
  }

  const failures = testResults.flat();
  return failures.reduce((mem, test) => {
    return {
      ...mem,
      [test]: (mem[test] || 0) + 1,
    };
  }, {});
};

export const getFailedTests = async (id) => {
  const data = await customFetch(
    `https://circleci.com/api/v2/project/github/transcom/mymove/${id}/tests`
  );

  if (!data.items) {
    return [];
  }

  return data.items
    .filter((item) => item.result === "failure")
    .map((item) => item.name);
};
