// Local-only preview. Exposes only the game's public HTML, scripts and assets.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
http.createServer((req,res)=>{
 let file;try{file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html'}catch{res.writeHead(400).end();return}
 if(req.method!=='GET'||!(/^(index|mars|communications)\.html$/.test(file)||/^(assets|js)\/[\w./-]+\.(js|css|svg|glb|png|jpg)$/.test(file))||file.split('/').includes('..')){res.writeHead(404).end();return}
 const dest=path.resolve(root,file);
 if(!dest.startsWith(root+path.sep)){res.writeHead(404).end();return}
 fs.readFile(dest,(error,data)=>{if(error){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.glb':'model/gltf-binary'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)});
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'));
