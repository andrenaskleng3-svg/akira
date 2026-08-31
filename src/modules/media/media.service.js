import client from "../../core/http.client.js";
import { load } from "cheerio";

const extract = (html) => {
  const $ = load(html);
  const source = $("script").text();
  const match = source.match(/(?:file|source)\s*[:=]\s*["']([^"']+)/i);
  return match?.[1] || null;
};

export async function resolveMedia(target){
  try {
    const {data} = await client.get(target);
    return extract(typeof data === "string" ? data : JSON.stringify(data)) || "-";
  } catch {
    return "-";
  }
}

export async function readMirror(target){
  const {data} = await client.get(target);
  return data;
}
