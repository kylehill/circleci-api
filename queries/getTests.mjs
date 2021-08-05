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
    mem[test.name] = mem[test.name] || {
      name: test.name,
      count: 0,
      message: test.message,
    };
    mem[test.name].count += 1;
    return mem;
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
    .map((item) => ({
      name: item.name,
      message: item.message,
    }));
};
