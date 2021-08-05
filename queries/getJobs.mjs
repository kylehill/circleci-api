import customFetch from "../customFetch.mjs";

export const getAllJobs = async (workflowIds) => {
  let workflowJobs = [];

  for (let idx = 0; idx < workflowIds.length; idx++) {
    const workflowId = workflowIds[idx];
    const result = await getJobs(workflowId);
    if (result !== false) {
      workflowJobs.push(result);
    }
  }

  return workflowJobs.flat();
};

export const getJobs = async (id) => {
  const data = await customFetch(
    `https://circleci.com/api/v2/workflow/${id}/job`
  );

  if (!data.items) {
    return {};
  }

  return data.items.reduce((mem, item) => {
    mem[item.name] = {
      number: item.job_number,
      status: item.status,
    };

    return mem;
  }, {});
};
