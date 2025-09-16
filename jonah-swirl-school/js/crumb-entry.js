import { preselectPillarFromHash, saveCrumb } from './storage.js';
import { compressFileToDataUrl } from './photos.js';

(function(){
  const form = document.getElementById('crumbForm');
  const pillarInputs = document.querySelectorAll('input[name="pillars"]');
  const text = document.getElementById('text');
  const tags = document.getElementById('tags');
  const photo = document.getElementById('photo');

  if (pillarInputs?.length) preselectPillarFromHash(pillarInputs);

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const selectedPillars = Array.from(pillarInputs).filter(input=>input.checked).map(input=>input.value);
    if(!selectedPillars.length || !text.value.trim()) return;

    let media = [];
    if(photo?.files?.length){
      for(const file of photo.files){
        if(file.type.startsWith('image/')){
          try{
            const { dataUrl, width, height } = await compressFileToDataUrl(file, { max: 1024, quality: .72 });
            media.push({ kind:'image', dataUrl, w: width, h: height, name: file.name });
          }catch(err){
            console.warn('Photo compression failed, skipping image', err);
          }
        }else{
          try{
            const dataUrl = await fileToDataUrl(file);
            media.push({ kind:'file', dataUrl, name: file.name, type: file.type });
          }catch(err){
            console.warn('File read failed, skipping', err);
          }
        }
      }
    }

    saveCrumb({
      pillars: selectedPillars,
      text: text.value.trim(),
      tags: tags.value.trim(),
      media
    });

    // Reset text & photo, keep pillar for easy next crumb
    text.value = ''; tags.value = ''; if(photo) photo.value = '';
  });

  function fileToDataUrl(file){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onerror = ()=> reject(new Error('Read failed'));
      reader.onload = ()=> resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
})();
