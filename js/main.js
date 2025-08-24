// ====== Default Seed (only used first time) ======
const DEFAULT_CONTENT = {
  hero: {
    title: "We create fast, modern & SEO-friendly websites 🚀",
    desc: "DesignNest helps startups & businesses shine online with cutting-edge designs, animations, and optimized user experience."
  },
  services: [
    { title: "⚡ Web Design", desc: "Modern responsive UI/UX with sleek animations and pixel-perfect layouts." },
    { title: "🛠️ Development", desc: "Robust & scalable websites built using latest frameworks and standards." },
    { title: "🚀 SEO Optimization", desc: "Rank higher with speed, mobile-friendliness & SEO-friendly code." }
  ],
  portfolio: [
    { name:"E-commerce UI", link:"#", category:"E-commerce", thumb:"https://picsum.photos/600/400?1" },
    { name:"Business Site", link:"#", category:"Business",   thumb:"https://picsum.photos/600/400?2" },
    { name:"Startup MVP",   link:"#", category:"Startup",    thumb:"https://picsum.photos/600/400?3" }
  ],
  pricing: [
    { name:"Basic", price:"$199", desc:"Landing Page + Basic SEO" },
    { name:"Pro", price:"$499", desc:"5 Pages Website + SEO + Animations" },
    { name:"Enterprise", price:"$999", desc:"Custom Project + Branding + Full Support" }
  ],
  messages: []
};

// Get / Set
function getContent() {
  const raw = localStorage.getItem("siteContent");
  if (!raw) {
    localStorage.setItem("siteContent", JSON.stringify(DEFAULT_CONTENT));
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }
  try { return JSON.parse(raw); } catch { 
    localStorage.setItem("siteContent", JSON.stringify(DEFAULT_CONTENT));
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }
}
function setContent(data){ localStorage.setItem("siteContent", JSON.stringify(data)); }

// Render Site
function renderSite() {
  const c = getContent();

  // Hero
  document.getElementById("hero-title").innerText = c.hero?.title || DEFAULT_CONTENT.hero.title;
  document.getElementById("hero-text").innerText  = c.hero?.desc  || DEFAULT_CONTENT.hero.desc;

  // Services
  const sg = document.getElementById("services-grid");
  sg.innerHTML = "";
  (c.services || []).forEach(s=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${s.title}</h3><p>${s.desc}</p>`;
    sg.appendChild(card);
  });

  // Portfolio
  const pg = document.getElementById("portfolio-grid");
  pg.innerHTML = "";
  (c.portfolio || []).forEach(p=>{
    const div = document.createElement("a");
    div.href = p.link || "#";
    div.target = p.link ? "_blank" : "_self";
    div.rel = "noopener";
    div.className = "project";
    div.innerHTML = `
      <span class="badge">${p.category || "Project"}</span>
      <img src="${p.thumb}" alt="${p.name || 'Project'}">
    `;
    pg.appendChild(div);
  });

  // Pricing
  const prg = document.getElementById("pricing-grid");
  prg.innerHTML = "";
  (c.pricing || []).forEach(p=>{
    const div = document.createElement("div");
    div.className = "price-card";
    div.innerHTML = `<h3>${p.name}</h3><p class="price">${p.price}</p><p>${p.desc}</p>`;
    prg.appendChild(div);
  });
}

// Contact form -> save message
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("c-name").value.trim();
    const email = document.getElementById("c-email").value.trim();
    const message = document.getElementById("c-message").value.trim();
    if(!name || !email || !message) return;

    const c = getContent();
    c.messages = c.messages || [];
    c.messages.unshift({
      id: Date.now(),
      name, email, message,
      at: new Date().toISOString()
    });
    setContent(c);

    document.getElementById("c-status").innerText = "Thanks! Your message has been sent.";
    form.reset();
    setTimeout(()=>{ document.getElementById("c-status").innerText = ""; }, 3000);
  });
}

// Mobile menu toggle + auto close on click
function setupMenu() {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", ()=> links.classList.toggle("show"));
  links.querySelectorAll("a").forEach(a=>{
    a.addEventListener("click", ()=> links.classList.remove("show"));
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderSite();
  setupContactForm();
  setupMenu();
});
