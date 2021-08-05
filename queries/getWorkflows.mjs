import customFetch from "../customFetch.mjs";

export const getAllWorkflows = async (recordIds) => {
  let workflows = [];

  for (let idx = 0; idx < recordIds.length; idx++) {
    const recordId = recordIds[idx];
    const result = await getWorkflows(recordId);
    workflows.push(result);
  }

  return workflows.flat();
};

export const getWorkflows = async (id) => {
  const data = await customFetch(
    `https://circleci.com/api/v2/pipeline/${id}/workflow`
  );

  return data.items.map((item) => {
    return {
      id: item.id,
      status: item.status,
    };
  });
};
