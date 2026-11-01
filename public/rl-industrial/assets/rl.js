/* RL Industrial · lógica compartida de la portada y las fichas. Los datos llegan en window.RL (los escribe herramientas/armar_rl_industrial.py). */
(function(){
"use strict";
var D = window.RL, BASE = window.RL_BASE || "", PAGE = document.body.dataset.page;
var P = D.propiedades;
var $ = function(s,c){return (c||document).querySelector(s)};
var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var fmt = function(n){return "$"+Math.round(n).toLocaleString("es-MX")};
var m2 = function(n){return n.toLocaleString("es-MX")+" m²"};
var byId = function(s){for(var i=0;i<P.length;i++)if(P[i].slug===s)return P[i]};

/* Íconos */
var I = {
  pin:'<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  area:'<path d="M3 3h6M3 3v6M21 3h-6M21 3v6M3 21h6M3 21v-6M21 21h-6M21 21v-6"/><rect x="7" y="7" width="10" height="10"/>',
  altura:'<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
  anden:'<path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-8h10v8M7 16h10"/>',
  trailer:'<path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  oficina:'<rect x="4" y="3" width="16" height="18"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
  rayo:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  check:'<path d="M4 12.5 9.5 18 20 6"/>',
  flecha:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  izq:'<path d="M15 5l-7 7 7 7"/>', der:'<path d="M9 5l7 7-7 7"/>',
  mas:'<path d="M12 5v14M5 12h14"/>',
  mapa:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  nav:'<path d="M3 11 21 3l-8 18-2-8z"/>',
  foto:'<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-9 8"/>',
  compartir:'<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>',
  tel:'<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>'
};
var ic = function(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+I[n]+'</svg>'};
var WA_IC = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4.1.1.1.7-.1 1.3z"/></svg>';

/* Fotos */
function src(f,w){return f.charAt(0)==="@"? D.remoto+f.slice(1) : BASE+"img/"+f+"-"+(w||1280)+".webp"}
function img(p,i,sizes,eager,cls){
  var f=p.fotos[i]; if(!f) return plano(p);
  var a=f[0], alt=(f[1]||p.nombre).replace(/"/g,"&quot;");
  var ss=a.charAt(0)==="@"?"":' srcset="'+src(a,640)+' 640w, '+src(a,1280)+' 1280w" sizes="'+(sizes||"100vw")+'"';
  return '<img src="'+src(a,a.charAt(0)==="@"?0:1280)+'"'+ss+' alt="'+alt+'" '+(eager?'fetchpriority="high"':'loading="lazy" decoding="async"')+(cls?' class="'+cls+'"':'')+' data-slug="'+p.slug+'" onerror="RLfoto(this)">';
}
window.RLfoto=function(el){var p=byId(el.dataset.slug);if(!p)return;var t=document.createElement("div");t.innerHTML=plano(p);var s=t.firstChild;if(el.parentNode)el.parentNode.replaceChild(s,el)};

/* Precio */
function precio(p){
  if(p.pm2) return {p:fmt(p.pm2),u:"/m² al mes",eq:"desde "+fmt(p.pm2*p.min)+" al mes",corto:fmt(p.pm2)+"/m²"};
  if(p.renta) return {p:fmt(p.renta),u:"al mes",eq:"≈ "+fmt(p.renta/p.min)+" por m²",corto:fmt(p.renta/1000)+"k"};
  return {p:"Consultar",u:p.operacion==="venta"?"venta":"",eq:p.operacion==="venta"?"Precio a desarrolladores":"Precio por WhatsApp",corto:"Consultar"};
}
function wa(t){return "https://wa.me/"+D.whatsapp+"?text="+encodeURIComponent(t)}
function gmaps(p){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.lugar||p.zona)}
function waze(p){return "https://waze.com/ul?ll="+p.lat+","+p.lng+"&navigate=yes"}
function url(p){return BASE+p.slug+"/"}

/* Plano esquemático (respaldo cuando no hay foto) */
function plano(p){
  var W=400,H=300,pad=40,area=p.max,ratio=p.local?1.25:1.6,L=Math.sqrt(area*ratio),A=area/L;
  var s=Math.min((W-2*pad)/L,(H-2*pad-20)/A),w=L*s,h=A*s,x=(W-w)/2,y=(H-h)/2-8;
  var st='stroke="#8CC63F"',g='<rect width="'+W+'" height="'+H+'" fill="#161C22"/>';
  for(var gx=0;gx<W;gx+=20)g+='<path d="M'+gx+' 0V'+H+'" stroke="#1E252D"/>';
  for(var gy=0;gy<H;gy+=20)g+='<path d="M0 '+gy+'H'+W+'" stroke="#1E252D"/>';
  if(p.lote){g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" '+st+' stroke-width="2" stroke-dasharray="9 6"/><path d="M'+(x-20)+' '+(y+h+16)+'h'+(w+40)+'" stroke="#97A2AC" stroke-width="7"/><text x="'+(x+w/2)+'" y="'+(y+h+36)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" fill="#97A2AC">AVENIDA PRINCIPAL</text>'}
  else{
    g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#1E252D" '+st+' stroke-width="2.5"/>';
    if(p.patio){var bw=w*.42,bh=h*.55;g+='<rect x="'+(x+10)+'" y="'+(y+10)+'" width="'+bw+'" height="'+bh+'" fill="#10151A" '+st+' stroke-width="1.6"/><text x="'+(x+10+bw/2)+'" y="'+(y+14+bh/2)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" fill="#8CC63F">BODEGA 950</text><text x="'+(x+w-10)+'" y="'+(y+h-12)+'" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="10" fill="#97A2AC">PATIO</text>'}
    else if(!p.local){var cols=Math.max(2,Math.min(8,Math.round(L/12))),rows=Math.max(1,Math.min(4,Math.round(A/12)));for(var i=1;i<cols;i++)for(var j=1;j<=rows;j++)g+='<rect x="'+(x+w*i/cols-2)+'" y="'+(y+h*j/(rows+1)-2)+'" width="4" height="4" fill="#8CC63F" opacity=".5"/>'}
    if(p.sizes){var tot=0,acc=0;p.sizes.forEach(function(v){tot+=v});p.sizes.slice(0,-1).forEach(function(v){acc+=v;g+='<path d="M'+(x+w*acc/tot)+' '+y+'v'+h+'" stroke="#8CC63F" stroke-width="1.3" stroke-dasharray="5 4"/>'})}
    if(p.oficinas){var ow=Math.min(w*.26,80),oh=Math.min(h*.34,48);g+='<rect x="'+(x+w-ow)+'" y="'+y+'" width="'+ow+'" height="'+oh+'" fill="#10151A" '+st+' stroke-width="1.4"/><text x="'+(x+w-ow/2)+'" y="'+(y+oh/2+4)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9" fill="#8CC63F">OFIC.</text>'}
    var n=p.andenes?Math.min(9,p.andenes):(p.trailer?1:0),dw=Math.min(18,w/(n*2+1));
    for(var k=0;k<n;k++)g+='<rect x="'+(x+(w/(n+1))*(k+1)-dw/2)+'" y="'+(y+h-3)+'" width="'+dw+'" height="6" fill="#F2F4F5"/>';
    if(p.torton)[.3,.65].forEach(function(q){g+='<rect x="'+(x+w*q-9)+'" y="'+(y+h-3)+'" width="18" height="6" fill="#97A2AC"/>'});
    if(p.local)g+='<path d="M'+x+' '+(y+h)+'h'+(w*.7)+'M'+x+' '+(y+h)+'v-'+(h*.7)+'" stroke="#F2F4F5" stroke-width="5"/>';
  }
  var dim="≈ "+Math.round(L)+" × "+Math.round(A)+" m";
  g+='<text x="'+(W/2)+'" y="'+(H-12)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#97A2AC">'+(p.lote?m2(p.max):dim)+' · PLANO APROXIMADO</text>';
  return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Plano aproximado de '+p.nombre+'">'+g+'</svg>';
}

/* Tarjeta de catálogo */
var lista = new Set();
function specs(p){
  var t=p.trailer===true?"Sí":p.trailer===false?(p.torton?"Torton":"No"):"—";
  var tercero=p.altura?[ic("altura"),p.altura+" m","Altura"]:p.andenes?[ic("anden"),p.andenes,"Andenes"]:[ic("oficina"),p.oficinas?"Sí":"—","Oficinas"];
  return '<div class="specs"><div class="spec">'+ic("area")+'<b>'+(p.min===p.max?m2(p.max):m2(p.min)+"+")+'</b><span>Superficie</span></div>'+
    '<div class="spec">'+ic("trailer")+'<b>'+t+'</b><span>Tráiler</span></div>'+
    '<div class="spec">'+tercero[0]+'<b>'+tercero[1]+'</b><span>'+tercero[2]+'</span></div></div>';
}
function card(p,i){
  var pr=precio(p);
  return '<article class="card" style="animation-delay:'+(i||0)*50+'ms">'+
   '<a class="foto" href="'+url(p)+'" aria-label="Ver ficha de '+p.nombre+'">'+img(p,0,"(max-width:700px) 100vw, 420px")+
     '<span class="chips"><span class="chip">'+p.tipo+'</span><span class="chip lima">'+(p.operacion==="venta"?"Venta":"Renta")+'</span></span>'+
     (p.fotos.length>1?'<span class="chip nfotos">'+ic("foto").replace('<svg','<svg width="13" height="13"')+' '+p.fotos.length+'</span>':'')+'</a>'+
   '<div class="cuerpo"><div class="zona-l">'+ic("pin")+p.zona+(p.entidad?" · "+p.entidad:"")+'</div>'+
     '<h3 class="rotulo"><a href="'+url(p)+'">'+p.nombre+'</a></h3><p class="desc">'+p.descripcion+'</p>'+specs(p)+
     '<div class="precio-l"><div class="p">'+pr.p+'<small>'+pr.u+'</small></div><div class="eq">'+pr.eq+'</div></div>'+
     '<div class="acciones"><a class="btn btn-lima btn-sm" href="'+url(p)+'">Ver ficha</a>'+
       (p.lat?'<a class="icono-b" href="'+gmaps(p)+'" target="_blank" rel="noopener" title="Ver en Google Maps" aria-label="Ver '+p.nombre+' en Google Maps">'+ic("mapa")+'</a>':'')+
       '<button class="icono-b" type="button" data-lista="'+p.slug+'" aria-pressed="'+lista.has(p.slug)+'" title="Agregar a mi lista de visitas" aria-label="Agregar '+p.nombre+' a mi lista de visitas">'+ic(lista.has(p.slug)?"check":"mas")+'</button></div>'+
   '</div></article>';
}

/* Lista de visitas */
function pintaLista(){
  var t=$("#listaV"); if(!t) return; var n=lista.size;
  t.classList.toggle("on",n>0); document.body.classList.toggle("con-lista",n>0);
  $("#listaTxt").textContent=n+(n===1?" bodega":" bodegas")+" para visitar";
  var ls=[];lista.forEach(function(s){var p=byId(s);ls.push("• "+p.folio+" · "+p.nombre+" ("+p.zona+", "+p.superficie+")")});
  $("#listaBtn").href=wa("Hola RL Industrial, quiero visitar estas bodegas:\n"+ls.join("\n")+"\n\n¿Me comparten horarios para agendar los recorridos?");
}
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-lista]"); if(!b) return;
  var s=b.dataset.lista; lista.has(s)?lista.delete(s):lista.add(s);
  $$('[data-lista="'+s+'"]').forEach(function(x){x.setAttribute("aria-pressed",lista.has(s));x.innerHTML=ic(lista.has(s)?"check":"mas")});
  pintaLista();
});

/* Header */
var top=$(".top");
function hdr(){top.classList.toggle("solida",scrollY>40)}
addEventListener("scroll",hdr,{passive:true});hdr();

/* Copiar teléfono */
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-copiar]"); if(!b) return;
  var t=b.dataset.copiar,ok=function(){var o=b.textContent;b.textContent="Copiado";setTimeout(function(){b.textContent=o},1600)};
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(ok,function(){});
});

/* Contadores */
function contar(el){
  var fin=+el.dataset.n; if(reduce){el.textContent=fin.toLocaleString("es-MX");return}
  var t0=null;function f(t){t0=t0||t;var k=Math.min(1,(t-t0)/1600),e=1-Math.pow(1-k,4);el.textContent=Math.round(fin*e).toLocaleString("es-MX");if(k<1)requestAnimationFrame(f)}
  setTimeout(function(){requestAnimationFrame(f)},1700);
}

/* Mapa (Leaflet) */
function tiles(m){
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'}).addTo(m);
}
function pinPrecio(p,sel){var pr=precio(p);return L.divIcon({className:"",iconSize:[0,0],html:'<span class="pin-precio'+(sel?" sel":"")+'" data-pin="'+p.slug+'">'+pr.corto+'</span>'})}
function popup(p){var pr=precio(p);
  return '<div class="pop">'+(p.fotos.length?'<img src="'+src(p.fotos[0][0],640)+'" alt="">':'')+'<div class="pi"><small>'+p.folio+' · '+p.zona+'</small><b>'+p.nombre+'</b><span>'+p.superficie+' · <strong>'+pr.p+'</strong> '+pr.u+'</span>'+
  '<div class="r"><a class="a" href="'+url(p)+'">Ver ficha</a><a class="b" href="'+gmaps(p)+'" target="_blank" rel="noopener">Google Maps</a></div><small>Ubicación aproximada</small></div></div>'}
function cargaLeaflet(cb){
  if(window.L) return cb();
  var c=document.createElement("link");c.rel="stylesheet";c.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(c);
  var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=cb;document.head.appendChild(s);
}
function alVer(el,cb){if(!el)return;if(!("IntersectionObserver" in window))return cb();var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();cb()}},{rootMargin:"400px"});io.observe(el)}

/* ---------------- Portada ---------------- */
if(PAGE==="inicio"){
  var st={zona:"Todas",tam:0,trailer:false,orden:"rec"};
  var TAM=[["Cualquier tamaño",0,1e9],["Hasta 600 m²",0,600],["600 a 2,000 m²",600,2000],["2,000 a 5,000 m²",2000,5000],["Más de 5,000 m²",5000,1e9]];
  var zonas={};P.forEach(function(p){if(p.lat)zonas[p.zona]=(zonas[p.zona]||0)+1});
  var ZN=Object.keys(zonas).sort(function(a,b){return zonas[b]-zonas[a]});

  /* Portada: fotos que rotan */
  var fotos=$$(".hero-fotos img"),pts=$$(".foto-de .pts i"),fi=0;
  function hfoto(i){fotos.forEach(function(f,k){f.classList.toggle("on",k===i)});pts.forEach(function(f,k){f.classList.toggle("on",k===i)});
    var a=$(".foto-de"),d=fotos[i].dataset;a.href=d.href;$(".foto-de b").textContent=d.nombre;$(".foto-de em").textContent=d.det}
  if(fotos.length>1&&!reduce)setInterval(function(){fi=(fi+1)%fotos.length;hfoto(fi)},6000);
  $$("[data-n]").forEach(contar);

  /* Buscador de portada */
  $("#bZona").innerHTML='<option value="Todas">Todas las zonas</option>'+ZN.map(function(z){return '<option>'+z+'</option>'}).join("");
  $("#bTam").innerHTML=TAM.map(function(t,i){return '<option value="'+i+'">'+t[0]+'</option>'}).join("");
  $("#buscador").addEventListener("submit",function(e){e.preventDefault();
    st.zona=$("#bZona").value;st.tam=+$("#bTam").value;st.trailer=$("#bTrailer").checked;$("#fTrailer").checked=st.trailer;pinta();
    $("#bodegas").scrollIntoView({behavior:reduce?"auto":"smooth"})});

  /* Destacadas */
  var riel=$("#riel");
  riel.innerHTML=P.filter(function(p){return p.destacada}).map(function(p){var pr=precio(p);
    return '<a class="dest" href="'+url(p)+'">'+img(p,0,"(max-width:700px) 80vw, 520px")+'<span class="chip-top chip">'+p.folio+' · '+p.tipo+'</span>'+
      '<span class="info"><span class="zona-l" style="color:var(--acero)">'+ic("pin")+p.zona+'</span><h3 class="rotulo">'+p.nombre+'</h3>'+
      '<span class="linea"><span><span class="precio">'+pr.p+'<small>'+pr.u+'</small></span><br><span class="m2">'+p.superficie+'</span></span><span class="ver">Ver ficha '+ic("flecha")+'</span></span></span></a>'}).join("");
  $$(".flechas button").forEach(function(b){b.addEventListener("click",function(){riel.scrollBy({left:(+b.dataset.dir)*riel.clientWidth*.8,behavior:"smooth"})})});

  /* Catálogo */
  function chips(){
    $("#fZona").innerHTML=["Todas"].concat(ZN).map(function(z){return '<button class="pill" type="button" data-zona="'+z+'" aria-pressed="'+(st.zona===z)+'">'+(z==="Todas"?"Todas las zonas":z)+(z!=="Todas"?'<span class="n">'+zonas[z]+'</span>':'')+'</button>'}).join("");
    $("#fTam").innerHTML=TAM.map(function(t,i){return '<button class="pill" type="button" data-tam="'+i+'" aria-pressed="'+(st.tam===i)+'">'+t[0]+'</button>'}).join("");
  }
  function filtra(){
    var lo=TAM[st.tam][1],hi=TAM[st.tam][2];
    var r=P.filter(function(p){return (st.zona==="Todas"||p.zona===st.zona)&&(!st.trailer||p.trailer===true)&&p.max>lo&&p.min<=hi});
    var pm=function(p){return p.pm2||(p.renta?p.renta/p.min:1e9)};
    if(st.orden==="m2")r.sort(function(a,b){return pm(a)-pm(b)});
    if(st.orden==="chica")r.sort(function(a,b){return a.min-b.min});
    if(st.orden==="grande")r.sort(function(a,b){return b.max-a.max});
    return r;
  }
  function pinta(){
    chips();var r=filtra();
    $("#cuenta").textContent=r.length+" de "+P.length+" inmuebles";
    $("#rejilla").innerHTML=r.length?r.map(card).join(""):'<div class="vacio">No hay inmuebles con esos filtros. <a href="#contacto">Pídenos que te busquemos uno</a>.</div>';
    $("#bZona").value=st.zona;$("#bTam").value=st.tam;
  }
  document.addEventListener("click",function(e){
    var z=e.target.closest("[data-zona]"),t=e.target.closest("[data-tam]");
    if(z){st.zona=z.dataset.zona;pinta()} if(t){st.tam=+t.dataset.tam;pinta()}
  });
  $("#fTrailer").addEventListener("change",function(e){st.trailer=e.target.checked;$("#bTrailer").checked=st.trailer;pinta()});
  $("#fOrden").addEventListener("change",function(e){st.orden=e.target.value;pinta()});
  pinta();

  /* Mapa grande */
  var conPin=P.filter(function(p){return p.lat});
  $("#mapaLista").innerHTML=conPin.map(function(p){var pr=precio(p);
    return '<button type="button" data-ir="'+p.slug+'">'+(p.fotos.length?'<img src="'+src(p.fotos[0][0],640)+'" alt="" loading="lazy" data-slug="'+p.slug+'" onerror="this.style.visibility=\'hidden\'">':'<span class="ph"></span>')+'<span><b>'+p.nombre+'</b><span>'+p.zona+' · '+p.superficie+'</span><br><em>'+pr.p+' '+pr.u+'</em></span></button>'}).join("");
  alVer($("#mapa"),function(){cargaLeaflet(function(){
    var m=L.map("mapa",{scrollWheelZoom:false,zoomControl:true}),marks={};tiles(m);
    var b=L.latLngBounds([]);
    conPin.forEach(function(p){var mk=L.marker([p.lat,p.lng],{icon:pinPrecio(p),riseOnHover:true}).addTo(m).bindPopup(popup(p),{maxWidth:260,minWidth:260});marks[p.slug]=mk;b.extend([p.lat,p.lng])});
    L.marker([D.oficina.lat,D.oficina.lng],{icon:L.divIcon({className:"",iconSize:[0,0],html:'<span class="pin-of"></span>'})}).addTo(m).bindPopup('<div class="pop"><div class="pi"><small>Oficina</small><b>RL Industrial</b><span>'+D.oficina.texto+'</span></div></div>',{minWidth:220,maxWidth:220});
    m.fitBounds(b,{padding:[40,40]});
    $$("#mapaLista [data-ir]").forEach(function(btn){btn.addEventListener("click",function(){
      var p=byId(btn.dataset.ir);$$("#mapaLista button").forEach(function(x){x.classList.toggle("sel",x===btn)});
      m.flyTo([p.lat,p.lng],13,{duration:reduce?0:1.1});setTimeout(function(){marks[p.slug].openPopup()},reduce?0:1100);
      if(innerWidth<880)$("#mapa").scrollIntoView({behavior:"smooth",block:"center"})})});
  })});

  /* Calculadora */
  var cp=P.filter(function(p){return p.pm2||p.renta});
  $("#cProp").innerHTML=cp.map(function(p){return '<option value="'+p.slug+'">'+p.folio+' · '+p.nombre+' — '+p.zona+'</option>'}).join("");
  $("#cProp").value="xhala-park";
  var meses=36;
  function calc(reset){
    var p=byId($("#cProp").value),r=$("#cM2");
    if(reset){r.min=p.min;r.max=p.max;r.step=p.max-p.min>2000?100:10;r.value=p.sizes?p.sizes[p.sizes.length-1]:p.min;r.disabled=p.min===p.max}
    var v=+r.value,pm=p.pm2||p.renta/p.min,tot=p.pm2?v*p.pm2:p.renta;
    $("#cMin").textContent=m2(p.min);$("#cMax").textContent=m2(p.max);$("#cVal").textContent=m2(v);
    $("#cTot").innerHTML=fmt(tot)+"<small>/mes</small>";$("#cPm2").textContent=fmt(pm)+(p.pm2?"":" (equivalente)");
    $("#cAnual").textContent=fmt(tot*12);$("#cContrato").textContent=fmt(tot*meses)+" · "+meses+" meses";
    $("#cAsk").href=wa("Hola RL Industrial, quiero cotizar "+p.folio+" · "+p.nombre+" ("+p.zona+").\nSuperficie: "+m2(v)+"\nPlazo: "+meses+" meses\nRenta estimada en su página: "+fmt(tot)+" al mes.\n¿Podemos agendar visita y negociar?");
  }
  $("#cProp").addEventListener("change",function(){calc(true)});$("#cM2").addEventListener("input",function(){calc()});
  $$("[data-meses]").forEach(function(b){b.addEventListener("click",function(){meses=+b.dataset.meses;$$("[data-meses]").forEach(function(x){x.setAttribute("aria-pressed",x===b)});calc()})});
  calc(true);

  /* Formulario de búsqueda */
  $("#busqueda").addEventListener("submit",function(e){e.preventDefault();
    var v=function(id){return $(id).value.trim()||"—"};
    var t="Hola RL Industrial, busco espacio industrial:\n• Empresa: "+v("#rEmp")+"\n• Giro: "+v("#rGiro")+"\n• Superficie: "+$("#rTam").selectedOptions[0].text+"\n• Zona: "+$("#rZona").value+"\n• Acceso: "+$("#rAcc").value+"\n¿Qué opciones tienen?";
    var a=document.createElement("a");a.href=wa(t);a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()});
  $("#rZona").innerHTML='<option>Cualquier zona</option>'+ZN.map(function(z){return '<option>'+z+'</option>'}).join("");
  $("#rTam").innerHTML=TAM.slice(1).map(function(t){return '<option>'+t[0]+'</option>'}).join("");
}

/* ---------------- Ficha ---------------- */
if(PAGE==="ficha"){
  var p=byId(window.RL_SLUG);
  /* Galería y visor */
  var vi=0,vis=$("#visor");
  function abre(i){if(!p.fotos.length)return;vi=i;vis.hidden=false;document.body.style.overflow="hidden";muestra()}
  function muestra(){var f=p.fotos[vi];$("#vImg").src=src(f[0],1280);$("#vImg").alt=f[1];$("#vCap").textContent=f[1];$("#vNum").textContent=(vi+1)+" / "+p.fotos.length}
  function cierra(){vis.hidden=true;document.body.style.overflow=""}
  function paso(d){vi=(vi+d+p.fotos.length)%p.fotos.length;muestra()}
  $$("[data-foto]").forEach(function(b){b.addEventListener("click",function(){abre(+b.dataset.foto)})});
  if(vis){$("#vPrev").onclick=function(){paso(-1)};$("#vNext").onclick=function(){paso(1)};$("#vX").onclick=cierra;
    vis.addEventListener("click",function(e){if(e.target===vis||e.target.classList.contains("vc"))cierra()});
    addEventListener("keydown",function(e){if(vis.hidden)return;if(e.key==="Escape")cierra();if(e.key==="ArrowLeft")paso(-1);if(e.key==="ArrowRight")paso(1)});
    var x0=null;$(".vc",vis).addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
    $(".vc",vis).addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>45)paso(dx<0?1:-1);x0=null});}

  /* Plano */
  var pl=$("#plano"); if(pl) pl.innerHTML=plano(p);

  /* Mini mapa */
  if(p.lat) alVer($("#miniMapa"),function(){cargaLeaflet(function(){
    var m=L.map("miniMapa",{scrollWheelZoom:false,dragging:!L.Browser.mobile,tap:false});tiles(m);
    m.setView([p.lat,p.lng],p.precision==="colonia"?14:12);
    L.circle([p.lat,p.lng],{radius:p.precision==="colonia"?700:2200,color:"#8CC63F",weight:2,fillColor:"#8CC63F",fillOpacity:.14}).addTo(m);
    L.marker([p.lat,p.lng],{icon:pinPrecio(p,true)}).addTo(m);
  })});

  /* Calculadora corta */
  var cm=$("#cmM2");
  if(cm){cm.min=p.min;cm.max=p.max;cm.step=p.max-p.min>2000?100:10;cm.value=p.sizes?p.sizes[p.sizes.length-1]:p.min;
    var cc=function(){var v=+cm.value;$("#cmVal").textContent=m2(v);$("#cmTot").textContent=fmt(v*p.pm2)+" al mes"};cm.addEventListener("input",cc);cc();}

  /* Compartir */
  var sh=$("#compartir");
  if(sh)sh.addEventListener("click",function(){
    var d={title:p.nombre+" · RL Industrial",text:p.tipo+" de "+p.superficie+" en "+p.zona,url:location.href};
    if(navigator.share)navigator.share(d).catch(function(){});
    else if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(function(){var o=sh.innerHTML;sh.textContent="Enlace copiado";setTimeout(function(){sh.innerHTML=o},1800)});
  });

  /* Otras bodegas */
  var rel=P.filter(function(x){return x.slug!==p.slug}).sort(function(a,b){return (b.zona===p.zona)-(a.zona===p.zona)||(b.destacada?1:0)-(a.destacada?1:0)}).slice(0,3);
  var rj=$("#otras"); if(rj) rj.innerHTML=rel.map(card).join("");
}
pintaLista();
})();
