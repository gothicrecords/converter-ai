const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");
const resultWrap = document.getElementById("resultWrap");
const resultImg = document.getElementById("resultImg");
const downloadLink = document.getElementById("downloadLink");

let selectedFile = null;

dropzone.addEventListener("click", ()=> fileInput.click());
dropzone.addEventListener("dragover", (e)=> { e.preventDefault(); dropzone.style.opacity=0.8; });
dropzone.addEventListener("dragleave", ()=> { dropzone.style.opacity=1; });
dropzone.addEventListener("drop", (e)=> {
  e.preventDefault();
  dropzone.style.opacity=1;
  const f = e.dataTransfer.files[0];
  handleFile(f);
});

fileInput.addEventListener("change", (e)=> {
  const f = e.target.files[0];
  handleFile(f);
});

function handleFile(f){
  if(!f) return;
  if(!f.type.startsWith("image/")) {
    status.textContent = "Please select an image file.";
    return;
  }
  selectedFile = f;
  status.textContent = `Selected: ${f.name} (${Math.round(f.size/1024)} KB)`;
  uploadBtn.disabled = false;
}

uploadBtn.addEventListener("click", async ()=>{
  if(!selectedFile) return;
  uploadBtn.disabled = true;
  status.textContent = "Uploading and upscaling... this may take a few seconds.";
  resultWrap.style.display = "none";
  try {
    const fd = new FormData();
    fd.append("image", selectedFile);
    const res = await fetch("/api/upscale", {
      method: "POST",
      body: fd
    });
    const j = await res.json();
    if(!res.ok) {
      status.textContent = j.error || "Upscale failed";
      uploadBtn.disabled = false;
      return;
    }
    const url = j.url;
    resultImg.src = url;
    downloadLink.href = url;
    resultWrap.style.display = "block";
    status.textContent = "Done!";
  } catch (err) {
    console.error(err);
    status.textContent = "Network or server error.";
  } finally {
    uploadBtn.disabled = false;
  }
});
