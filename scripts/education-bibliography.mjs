import { readFile, mkdir, writeFile } from 'node:fs/promises';
const sources=JSON.parse(await readFile('data/education/source/content/sources.json','utf8'));
await mkdir('data/education/bibliography',{recursive:true});
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim();
async function collect(source){
  const report={sourceKey:source.id,originalTitle:source.title,sourceUrl:source.url,checkedAt:new Date().toISOString(),status:'unresolved'};
  try{
    const url=new URL(source.url);
    const doi=url.hostname==='doi.org'?decodeURIComponent(url.pathname.slice(1)):url.hostname.endsWith('nber.org')&&/^\/papers\/w\d+\/?$/.test(url.pathname)?`10.3386/${url.pathname.split('/')[2]}`:null;
    const requestUrl=doi?`https://api.crossref.org/works/${encodeURIComponent(doi)}`:source.url;
    const response=await fetch(requestUrl,{signal:AbortSignal.timeout(18000)});
    report.httpStatus=response.status;report.resolvedUrl=response.url;
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    if(doi){
      const json=await response.json();const item=json.message;
      if(item?.DOI?.toLowerCase()!==doi.toLowerCase())throw new Error('Crossref DOI mismatch');
      report.metadata={doi:item.DOI,title:item.title?.[0],authors:item.author?.map(a=>[a.given,a.family].filter(Boolean).join(' ')),published:item.published?.['date-parts'],type:item.type,publisher:item.publisher};
      report.status='identifier-verified-metadata';
    }else if(response.headers.get('content-type')?.includes('text/html')){
      const html=await response.text();
      const tags=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);
      const metadata={};
      for(const tag of tags){
        const attrs={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g))attrs[m[1].toLowerCase()]=decode(m[3]);
        const name=attrs.name??attrs.property;
        if(['citation_title','citation_doi','citation_publication_date','og:title'].includes(name)&&attrs.content)metadata[name]=attrs.content;
      }
      const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
      if(title)metadata.pageTitle=decode(title.replace(/<[^>]*>/g,''));
      report.metadata=metadata;report.status='page-metadata-needs-review';
    }else{
      // Do not download full papers or copy source text merely to get a title.
      await response.body?.cancel();report.status='non-html-needs-bibliographic-review';
    }
  }catch(error){report.error=error.message;}
  await writeFile(`data/education/bibliography/${source.id}.json`,JSON.stringify(report,null,2)+'\n');
  console.log(`${source.id}: ${report.status}`);
}
for(let i=0;i<sources.length;i+=3)await Promise.allSettled(sources.slice(i,i+3).map(collect)).then(results=>{for(const result of results)if(result.status==='rejected')throw result.reason;});
