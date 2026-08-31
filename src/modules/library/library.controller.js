import client from "../../core/http.client.js";
import { load } from "cheerio";
import { baseUrl,onGoingAnime,completeAnime,schedule,genreList } from "../../config/source.config.js";

const slugOf = (link="") => {
 const clean = link.split("?")[0].replace(/\/$/,"");
 return clean.split("/").filter(Boolean).pop() || "";
};

// Otakudesu punya 3 layout kartu berbeda:
//  - beranda/ongoing/completed : .venz ul li
//  - halaman genre             : .col-anime (judul di .col-anime-title)
//  - hasil pencarian           : ul.chivsrc li
const mapCards = ($) => {
 const grid = $(".venz ul li").map((_,e)=>{
  const el=$(e), link=el.find("a").attr("href")||"";
  return {
   name: el.find(".jdlflm,h2").text().trim(),
   key: slugOf(link),
   image: el.find("img").attr("src")||"",
   url: link,
   episode: el.find(".epz").text().trim() || "",
   date: el.find(".newnime,.epztipe").text().trim() || ""
  };
 }).get().filter(x=>x.name && x.key);
 if(grid.length) return grid;

 const genrePage = $(".col-anime").map((_,e)=>{
  const el=$(e), a=el.find(".col-anime-title a").first(), link=a.attr("href")||"";
  return {
   name: a.text().trim(),
   key: slugOf(link),
   image: el.find(".col-anime-cover img").attr("src")||el.find("img").attr("src")||"",
   url: link,
   episode: el.find(".col-anime-eps").text().trim(),
   rating: el.find(".col-anime-rating").text().trim(),
   studio: el.find(".col-anime-studio").text().trim(),
   date: el.find(".col-anime-date").text().trim(),
   genres: el.find(".col-anime-genre a").map((_,g)=>$(g).text().trim()).get()
  };
 }).get().filter(x=>x.name && x.key);
 if(genrePage.length) return genrePage;

 const searchPage = $("ul.chivsrc li").map((_,e)=>{
  const el=$(e), a=el.find("h2 a").first(), link=a.attr("href")||"";
  return {
   name: a.text().trim(),
   key: slugOf(link),
   image: el.find("img").attr("src")||"",
   url: link,
   genres: el.find(".set b:contains('Genres')").parent().find("a").map((_,g)=>$(g).text().trim()).get(),
   status: el.find(".set").eq(1).text().replace(/^\s*Status\s*:\s*/,"").trim(),
   rating: el.find(".set").eq(2).text().replace(/^\s*Rating\s*:\s*/,"").trim()
  };
 }).get().filter(x=>x.name && x.key);
 return searchPage;
};

async function page(res,url){
 try{const r=await client.get(url);res.json({ok:true,items:mapCards(load(r.data))});}
 catch(e){res.json({ok:false,error:e.message,items:[]});}}

export const home=(req,res)=>page(res,baseUrl);
export const getCurrentCatalog=(req,res)=>page(res,`${baseUrl}${onGoingAnime}${req.params.page?`page/${req.params.page}`:""}`);
export const getArchiveCatalog=(req,res)=>page(res,`${baseUrl}${completeAnime}${req.params.page?`page/${req.params.page}`:""}`);

export async function schedules(req,res){
 try{
  const {data}=await client.get(baseUrl+schedule);
  const $=load(data);
   res.json($(".kglist321").map((_,x)=>({
    day:$(x).find("h2").text().trim(),
    items:$(x).find("li a").map((_,a)=>({name:$(a).text().trim(),key:slugOf($(a).attr("href")||"")})).get().filter(i=>i.name)
   })).get().filter(d=>d.day || d.items.length));
 }catch(e){res.json([]);}
}

export async function genre(req,res){
 try{
  const {data}=await client.get(baseUrl+genreList); const $=load(data);
  const list=$(".genres a, ul.genres li a").map((_,a)=>{
   const url=$(a).attr("href")||"";
   return {name:$(a).text().trim(),slug:slugOf(url),url};
  }).get().filter(g=>g.slug);
  res.json(list);
 }catch(e){res.json([]);}
}

// Halaman genre di Otakudesu berada di /genres/<slug>/page/<n>/,
// bukan di bawah /genre-list/. Salah prefix inilah yang membuat hasil kosong.
export async function animeByGenre(req,res){
 const id = slugOf(req.params.id || "");
 const pageNumber = Number(req.params.pageNumber) || 1;
 if(!id) return res.json({ok:false,error:"genre tidak valid",items:[]});

 const candidates = [
  `${baseUrl}genres/${id}/page/${pageNumber}/`,
  `${baseUrl}genre/${id}/page/${pageNumber}/`,
 ];
 for(const url of candidates){
  try{
   const r = await client.get(url);
   const items = mapCards(load(r.data));
   if(items.length) return res.json({ok:true,items,source:url});
  }catch(e){/* coba pola URL berikutnya */}
 }
 return res.json({ok:true,items:[],note:"genre tidak menghasilkan data"});
}

export async function search(req,res){
 const q = encodeURIComponent(req.params.query || "");
 const candidates = [
  `${baseUrl}?s=${q}&post_type=anime`,
  `${baseUrl}?s=${q}`,
 ];
 for(const url of candidates){
  try{
   const r = await client.get(url);
   const items = mapCards(load(r.data));
   if(items.length) return res.json({ok:true,items});
  }catch(e){/* lanjut */}
 }
 return res.json({ok:true,items:[]});
}
