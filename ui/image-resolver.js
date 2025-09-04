// Case-smart image resolver utilities
export function resolveImage(img){
  if(!img) return;
  const folder = (img.dataset.folder || "").replace(/\/?$/, '/');
  const name = img.dataset.name || "";
  const exts = (img.dataset.ext || "png,PNG,jpg,JPG,webp,WEBP").split(",");
  let i = 0;
  function tryNext(){
    if(i >= exts.length) return;
    const candidate = folder + name + "." + exts[i++];
    const probe = new Image();
    probe.onload = () => { img.src = candidate; };
    probe.onerror = tryNext;
    probe.src = candidate;
  }
  tryNext();
}

export function resolveBgVar(cssVarName, basePathNoExt){
  const exts = ["png","PNG","jpg","JPG","jpeg","JPEG","webp","WEBP"];
  let i=0;
  function tryNext(){
    if(i>=exts.length) return;
    const url = basePathNoExt + "." + exts[i++];
    const img = new Image();
    img.onload = () => { document.documentElement.style.setProperty(cssVarName, `url("${url}")`); };
    img.onerror = tryNext;
    img.src = url;
  }
  tryNext();
}
