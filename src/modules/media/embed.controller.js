import Axios from "axios";
import { headers } from "../../config/request.config.js";
import { baseUrl } from "../../config/source.config.js";

// Host video (desustream, mp4upload, dsb) mengirim X-Frame-Options / CSP
// frame-ancestors sehingga iframe langsung dari browser ditolak
// ("menolak untuk terhubung"). Proxy ini mengambil halaman embed dari sisi
// server dengan Referer resmi, lalu menyajikannya same-origin tanpa header
// pemblokir frame.
const ALLOWED_HOST_PATTERN =
  /(desustream|otakudesu|mp4upload|blogger|googlevideo|youtube|acefile|kotakanimedia|filedon|streamtape|pixeldrain|odstream|hxfile)/i;

function absolutize(html, target) {
  const origin = new URL(target).origin;
  const base = `<base href="${target}">`;
  // Sisipkan <base> agar aset relatif tetap resolve ke host aslinya.
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
  return `${base}${html}`.replace(/__ORIGIN__/g, origin);
}

export async function embedProxy(req, res) {
  const target = req.query.url;
  if (!target || !/^https?:\/\//i.test(target)) {
    return res.status(400).send("Parameter url tidak valid");
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return res.status(400).send("Parameter url tidak valid");
  }
  if (!ALLOWED_HOST_PATTERN.test(parsed.hostname)) {
    return res.status(403).send("Host tidak diizinkan");
  }

  try {
    const response = await Axios.get(target, {
      headers: { ...headers, Referer: baseUrl, Origin: baseUrl.replace(/\/$/, "") },
      timeout: 20000,
      maxRedirects: 5,
      responseType: "text",
      transformResponse: [(d) => d],
      validateStatus: () => true,
    });

    const contentType = String(response.headers["content-type"] || "");
    if (!contentType.includes("html")) {
      if (!/text\/|json|mpegurl/i.test(contentType)) {
        // Media biner (mp4/ts) — biarkan browser mengambil langsung.
        return res.redirect(target);
      }
      // Sumber teks (m3u8/json) — teruskan apa adanya.
      res.setHeader("content-type", contentType || "application/octet-stream");
      res.setHeader("access-control-allow-origin", "*");
      return res.status(response.status).send(response.data);
    }

    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("access-control-allow-origin", "*");
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    return res.status(response.status).send(absolutize(String(response.data), target));
  } catch (err) {
    return res
      .status(502)
      .send(`<body style="background:#0a0a12;color:#9aa">Gagal memuat sumber video: ${err.message}</body>`);
  }
}
