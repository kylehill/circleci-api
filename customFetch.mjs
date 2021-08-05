import fetch from "node-fetch";
import env from "./env.mjs";

export default async (baseUrl, obj = {}) => {
  const queryString = Object.entries(obj)
    .filter(([key, val]) => !!val)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  const url = queryString.length > 0 ? `${baseUrl}?${queryString}` : baseUrl;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Circle-Token": env["Circle-Token"],
      },
    });

    const data = await response.json();

    if (data.items) {
      return data;
    }
  } catch (e) {
    return {};
  }
};
