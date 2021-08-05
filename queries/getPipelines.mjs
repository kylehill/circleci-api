import customFetch from "../customFetch.mjs";

export const getAllPipelines = async (days) => {
  const searchBoundaryDate = Date.now() - 1000 * 60 * 60 * 24 * days;
  let pipelines = [];
  let pageToken;

  while (true) {
    const result = await getPipelines(pageToken);
    pageToken = result.pageToken;

    const filtered = result.results.filter(
      (p) => p.startTime > searchBoundaryDate
    );

    pipelines.push(filtered);
    if (filtered.length < 20) {
      break;
    }
  }

  return pipelines.flat();
};

export const getPipelines = async (pageToken) => {
  const data = await customFetch(
    "https://circleci.com/api/v2/project/github/transcom/mymove/pipeline",
    {
      branch: "master",
      "page-token": pageToken,
    }
  );

  return {
    results: data.items.map((item) => {
      return {
        id: item.id,
        number: item.number,
        startTime: Date.parse(item.created_at),
      };
    }),
    pageToken: data.next_page_token,
  };
};
