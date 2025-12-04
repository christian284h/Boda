// Fecha de inicio: hoy 4 de noviembre de 2025
const fechaInicio = new Date(2025, 10, 4, 0, 0, 0); 
// Nota: en JavaScript los meses van de 0 a 11, por eso noviembre = 10

// Fecha final: 10 de enero de 2026
const fechaFinal = new Date(2026, 0, 10, 0, 0, 0); 

function actualizarContador() {
  const ahora = new Date();

  // Si aún no llegó la fecha de inicio, mostrar ceros
  if (ahora < fechaInicio) {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    return;
  }

  // Si ya pasó la fecha final, mostrar ceros
  if (ahora > fechaFinal) {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    return;
  }

  // Diferencia entre la fecha final y el momento actual
  const diferencia = fechaFinal.getTime() - ahora.getTime();

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
  const segundos = Math.floor((diferencia / 1000) % 60);

  document.getElementById("days").textContent = String(dias).padStart(2, "0");
  document.getElementById("hours").textContent = String(horas).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutos).padStart(2, "0");
  document.getElementById("seconds").textContent = String(segundos).padStart(2, "0");
}

// Inicia el contador cuando la página está lista
document.addEventListener("DOMContentLoaded", () => {
  actualizarContador();
  setInterval(actualizarContador, 1000);
});

// Animación al hacer scroll (revela secciones)
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
    }
  });
},{threshold:0.15});
document.querySelectorAll(".section-content").forEach(el => observer.observe(el));

// Agregar a calendario (archivo ICS dinámico)
document.getElementById("addToCalendar").addEventListener("click", () => {
  const start = "20251025T160000";
  const end = "20251025T200000";
  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Alex&Meli//Boda//ES
BEGIN:VEVENT
UID:${Date.now()}@alexmeli
DTSTAMP:${start}Z
DTSTART:${start}Z
DTEND:${end}Z
SUMMARY:Boda de Alex & Meli
LOCATION:Parroquia San Juan Bautista; Salón de Eventos La Mansión
DESCRIPTION:¡Acompáñanos a celebrar!
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], {type:"text/calendar"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "boda-alex-meli.ics"; a.click();
  URL.revokeObjectURL(url);
});

// Conteo de regalos (local)
let gifts = 0;
document.getElementById("addGift").addEventListener("click", () => {
  gifts++;
  document.getElementById("giftCount").textContent = gifts;
});

// RSVP -> Google Sheets (Apps Script Web App)
const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbxGMkJxDLOybjhrAY8xN8QwTD9F6_385LtQQJXZN7mhwRlBcgJDPsvPqdICJmSwwXeR/exec"; // Reemplaza con tu URL

document.getElementById("rsvpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    nombre: form.nombre.value,
    correo: form.correo.value,
    telefono: form.telefono.value,
    asistencia: form.asistencia.value,
    pases: form.pases.value,
    comentarios: form.comentarios.value,
    timestamp: new Date().toISOString()
  };
  try{
    const res = await fetch(RSVP_ENDPOINT, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(data)
    });
    if(!res.ok) throw new Error("Error al enviar RSVP");
    document.getElementById("rsvpStatus").textContent = "¡Confirmación enviada! Gracias.";
    form.reset();
  }catch(err){
    document.getElementById("rsvpStatus").textContent = "Hubo un problema. Intenta nuevamente.";
  }
});

// Subir foto al álbum (ejemplo con carga base64 a Apps Script)
const PHOTO_ENDPOINT = "https://script.google.com/macros/s/AKfycbxlj9xzPVw4PU4oaZNPrS6TCQNiYqSiLgDqudCE67yKBbcRv6n8DhG6zX0Fe0wekzUI/exec"; // Reemplaza con tu URL

document.getElementById("photoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("photoInput").files[0];
  if(!file){
    document.getElementById("uploadStatus").textContent = "Selecciona una foto primero.";
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(",")[1];
    try{
      const res = await fetch(PHOTO_ENDPOINT, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          filename: `foto-${Date.now()}.jpg`,
          mimeType: file.type,
          data: base64,
          timestamp: new Date().toISOString()
        })
      });
      if(!res.ok) throw new Error("Error al subir foto");
      document.getElementById("uploadStatus").textContent = "¡Foto subida al álbum!";
      // Opcional: recargar galería
      loadGallery();
    }catch(err){
      document.getElementById("uploadStatus").textContent = "No se pudo subir la foto.";
    }
  };
  reader.readAsDataURL(file);
});

// Cargar galería desde Apps Script/Sheet
async function loadGallery(){
  const GALLERY_JSON = "https://script.google.com/macros/library/d/1CnQpP48yGYgFN82oYPkYgZUYcICi5Hp5qNZ3BewaEQ1dOsjM91R-vLuR/2"; // Reemplaza
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  try{
    const res = await fetch(GALLERY_JSON);
    const images = await res.json(); // [{url:"..."}, ...]
    images.forEach(img => {
      const el = document.createElement("img");
      el.src = img.url;
      el.alt = "Foto del álbum";
      gallery.appendChild(el);
    });
  }catch{
    // fallback de ejemplo
    ["assets/gallery1.jpg","assets/gallery2.jpg","assets/gallery3.jpg"].forEach(src=>{
      const el = document.createElement("img"); el.src = src; el.alt = "Foto del álbum"; gallery.appendChild(el);
    });
  }
}
loadGallery();