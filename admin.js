// ===== Admin Config =====
const PASS_KEY = "adminPassword";
const DEFAULT_PASS = "admin123"; // change after first login

// ===== Helpers =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function getContent() {
  const raw = localStorage.getItem("siteContent");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function setContent(data){ localStorage.setItem("siteContent", JSON.stringify(data)); }
function ensureDefaults(){
  if(!localStorage.getItem("siteContent")){
    // sync with site defaults (same as main.js)
    localStorage.setItem("siteContent", JSON.stringify({
      hero:{ title:"We create fast, modern & SEO-friendly websites 🚀", desc:"DesignNest helps startups & businesses shine online with cutting-edge designs, animations, and optimized user experience." },
      services:[
        { title:"⚡ Web Design", desc:"Modern responsive UI/UX with sleek animations and pixel-perfect layouts." },
        { title:"🛠️ Development", desc:"Robust & scalable websites built using latest frameworks and standards." },
        { title:"🚀 SEO Optimization", desc:"Rank higher with speed, mobile-friendliness & SEO-friendly code." }
      ],
      portfolio:[
        { name:"E-commerce UI", link:"#", category:"E-commerce", thumb:"https://picsum.photos/600/400?1" },
        { name:"Business Site", link:"#", category:"Business",   thumb:"https://picsum.photos/600/400?2" },
        { name:"Startup MVP",   link:"#", category:"Startup",    thumb:"https://picsum.photos/600/400?3" }
      ],
      pricing:[
        { name:"Basic", price:"$199", desc:"Landing Page + Basic SEO" },
        { name:"Pro", price:"$499", desc:"5 Pages Website + SEO + Animations" },
        { name:"Enterprise", price:"$999", desc:"Custom Project + Branding + Full Support" }
      ],
      messages:[]
    }));
  }
  if(!localStorage.getItem(PASS_KEY)){
    localStorage.setItem(PASS_KEY, DEFAULT_PASS);
  }
}

// ===== Login =====
function setupLogin(){
  const btn = $("#login-btn");
  btn.addEventListener("click", ()=>{
    const pass = $("#admin-pass").value;
    const real = localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
    if(pass === real){
      $("#login-screen").style.display = "none";
      $("#dashboard").style.display = "grid";
      initDashboard();
    }else{
      $("#login-msg").innerText = "Wrong password!";
    }
  });
}

// ===== Dashboard Tabs =====
function setupTabs(){
  $$(".dash-nav button").forEach(b=>{
    b.addEventListener("click", ()=>{
      $$(".dash-nav button").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      const id = b.getAttribute("data-tab");
      $$(".tab-panel").forEach(p=>p.classList.remove("active"));
      $("#"+id).classList.add("active");
    });
  });
}

// ===== Overview & Counters =====
function refreshCounters(){
  const c = getContent();
  $("#k-services").innerText = (c.services||[]).length;
  $("#k-projects").innerText = (c.portfolio||[]).length;
  $("#k-plans").innerText    = (c.pricing||[]).length;
  $("#k-messages").innerText = (c.messages||[]).length;

  $("#ov-hero-title").innerText = c.hero?.title || "";
  $("#ov-hero-desc").innerText  = c.hero?.desc  || "";

  const o = $("#ov-recent-msgs");
  o.innerHTML = "";
  (c.messages||[]).slice(0,5).forEach(m=>{
    const div = document.createElement("div");
    div.className = "item";
    const d = new Date(m.at);
    div.innerHTML = `<b>${m.name}</b> • <span class="muted">${m.email}</span> <br><span class="muted">${d.toLocaleString()}</span><p>${m.message}</p>`;
    o.appendChild(div);
  });
}

// ===== Hero =====
function loadHero(){
  const c = getContent();
  $("#hero-title-input").value = c.hero?.title || "";
  $("#hero-text-input").value  = c.hero?.desc || "";
}
function saveHero(){
  const c = getContent();
  c.hero = {
    title: $("#hero-title-input").value.trim(),
    desc: $("#hero-text-input").value.trim()
  };
  setContent(c);
  refreshCounters();
}

// ===== Services (CRUD) =====
function renderServices(){
  const list = $("#svc-list");
  const c = getContent();
  list.innerHTML = "";
  (c.services||[]).forEach((s,i)=>{
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <b>${s.title}</b>
      <p class="muted" style="margin:6px 0;">${s.desc}</p>
      <div class="actions">
        <button class="btn small" data-edit="${i}">Edit</button>
        <button class="btn small danger" data-del="${i}">Delete</button>
      </div>
    `;
    list.appendChild(el);
  });

  list.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.getAttribute("data-del");
      const c = getContent();
      c.services.splice(i,1);
      setContent(c);
      renderServices(); refreshCounters();
    });
  });

  list.querySelectorAll("[data-edit]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.getAttribute("data-edit");
      const c = getContent();
      $("#svc-title").value = c.services[i].title;
      $("#svc-desc").value  = c.services[i].desc;
      $("#svc-add").innerText = "Save Changes";
      $("#svc-add").setAttribute("data-editing", i);
    });
  });
}
function setupServiceForm(){
  $("#svc-add").addEventListener("click", ()=>{
    const title = $("#svc-title").value.trim();
    const desc  = $("#svc-desc").value.trim();
    if(!title || !desc) return;

    const c = getContent();
    c.services = c.services || [];
    const idx = $("#svc-add").getAttribute("data-editing");
    if(idx !== null && idx !== "" && +idx >= 0){
      c.services[+idx] = { title, desc };
      $("#svc-add").innerText = "Add Service";
      $("#svc-add").removeAttribute("data-editing");
    } else {
      c.services.push({ title, desc });
    }
    setContent(c);
    $("#svc-title").value = ""; $("#svc-desc").value = "";
    renderServices(); refreshCounters();
  });
}

// ===== Portfolio (CRUD with image upload) =====
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderPortfolio(){
  const wrap = $("#pf-list");
  wrap.innerHTML = "";
  const c = getContent();
  (c.portfolio||[]).forEach((p,i)=>{
    const card = document.createElement("div");
    card.className = "card-row";
    card.innerHTML = `
      <img src="${p.thumb}" alt="${p.name}" class="thumb"/>
      <div class="meta">
        <b>${p.name}</b>
        <div class="muted">${p.category || "Project"} • <a href="${p.link||'#'}" target="_blank" rel="noopener">${p.link||''}</a></div>
      </div>
      <div class="actions">
        <button class="btn small" data-edit="${i}">Edit</button>
        <button class="btn small danger" data-del="${i}">Delete</button>
      </div>
    `;
    wrap.appendChild(card);
  });

  wrap.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.getAttribute("data-del");
      const c = getContent();
      c.portfolio.splice(i,1);
      setContent(c);
      renderPortfolio(); refreshCounters();
    });
  });

  wrap.querySelectorAll("[data-edit]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.getAttribute("data-edit");
      const c = getContent();
      $("#pf-name").value = c.portfolio[i].name || "";
      $("#pf-link").value = c.portfolio[i].link || "";
      $("#pf-category").value = c.portfolio[i].category || "";
      $("#pf-edit-index").value = String(i);
      $("#pf-add").innerText = "Save Changes";
      $("#pf-thumb").value = ""; // keep existing unless new file chosen
      window.scrollTo({top:0, behavior:"smooth"});
    });
  });
}

function setupPortfolioForm(){
  $("#pf-add").addEventListener("click", async ()=>{
    const name = $("#pf-name").value.trim();
    const link = $("#pf-link").value.trim();
    const category = $("#pf-category").value.trim();
    const idx = +($("#pf-edit-index").value || -1);
    const file = $("#pf-thumb").files[0];

    if(!name) return;

    const c = getContent();
    c.portfolio = c.portfolio || [];

    let thumb;
    if(file){ thumb = await fileToDataURL(file); }

    if(idx >= 0){
      // edit
      const item = c.portfolio[idx];
      item.name = name;
      item.link = link;
      item.category = category;
      if(thumb) item.thumb = thumb;
      c.portfolio[idx] = item;
      $("#pf-add").innerText = "Add Project";
      $("#pf-edit-index").value = "-1";
    } else {
      // add
      c.portfolio.unshift({
        name, link, category,
        thumb: thumb || "https://picsum.photos/600/400?random=" + Date.now()
      });
    }

    setContent(c);
    $("#pf-name").value = ""; $("#pf-link").value = ""; $("#pf-category").value = ""; $("#pf-thumb").value = "";
    renderPortfolio(); refreshCounters();
  });
}

// ===== Pricing (CRUD) =====
function renderPricing(){
  const list = $("#pr-list");
  const c = getContent();
  list.innerHTML = "";
  (c.pricing||[]).forEach((p,i)=>{
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <b>${p.name}</b> <span class="muted">— ${p.price}</span>
      <p class="muted" style="margin:6px 0;">${p.desc}</p>
      <div class="actions">
        <button class="btn small" data-edit="${i}">Edit</button>
        <button class="btn small danger" data-del="${i}">Delete</button>
      </div>
    `;
    list.appendChild(el);
  });

  list.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.getAttribute("data-del");
      const c = getContent();
      c.pricing.splice(i,1);
      setContent(c);
      renderPricing(); refreshCounters();
    });
  });

  list.querySelectorAll("[data-edit]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.getAttribute("data-edit");
      const c = getContent();
      $("#pr-name").value = c.pricing[i].name;
      $("#pr-price").value = c.pricing[i].price;
      $("#pr-desc").value = c.pricing[i].desc;
      $("#pr-edit-index").value = String(i);
      $("#pr-add").innerText = "Save Changes";
      window.scrollTo({top:0, behavior:"smooth"});
    });
  });
}
function setupPricingForm(){
  $("#pr-add").addEventListener("click", ()=>{
    const name = $("#pr-name").value.trim();
    const price = $("#pr-price").value.trim();
    const desc = $("#pr-desc").value.trim();
    const idx  = +($("#pr-edit-index").value || -1);
    if(!name || !price || !desc) return;

    const c = getContent();
    c.pricing = c.pricing || [];

    if(idx >= 0){
      c.pricing[idx] = { name, price, desc };
      $("#pr-add").innerText = "Add Plan";
      $("#pr-edit-index").value = "-1";
    } else {
      c.pricing.push({ name, price, desc });
    }

    setContent(c);
    $("#pr-name").value=""; $("#pr-price").value=""; $("#pr-desc").value="";
    renderPricing(); refreshCounters();
  });
}

// ===== Messages =====
function renderMessages(){
  const m = getContent().messages || [];
  const wrap = $("#msg-list");
  if(!m.length){ wrap.innerHTML = `<p class="muted">No messages yet.</p>`; return; }

  let html = `
    <div class="table-row head">
      <div>Name</div><div>Email</div><div>Message</div><div>Time</div><div>Actions</div>
    </div>
  `;
  m.forEach((x,i)=>{
    const d = new Date(x.at);
    html += `
      <div class="table-row">
        <div>${x.name}</div>
        <div>${x.email}</div>
        <div>${x.message}</div>
        <div>${d.toLocaleString()}</div>
        <div><button class="btn small danger" data-del="${i}">Delete</button></div>
      </div>
    `;
  });
  wrap.innerHTML = html;

  wrap.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.getAttribute("data-del");
      const c = getContent();
      c.messages.splice(i,1);
      setContent(c);
      renderMessages(); refreshCounters();
    });
  });
}

// ===== Settings =====
function setupSettings(){
  $("#set-pass-save").addEventListener("click", ()=>{
    const v = $("#set-pass").value.trim();
    if(!v){ alert("Enter a new password."); return; }
    localStorage.setItem(PASS_KEY, v);
    $("#set-pass").value = "";
    alert("Password updated.");
  });
  $("#set-reset").addEventListener("click", ()=>{
    if(confirm("This will erase all content and messages. Continue?")){
      localStorage.removeItem("siteContent");
      location.reload();
    }
  });
}

// ===== Init =====
function initDashboard(){
  setupTabs();
  loadHero(); renderServices(); renderPortfolio(); renderPricing(); renderMessages();
  refreshCounters();

  $("#save-hero").addEventListener("click", saveHero);
  setupServiceForm();
  setupPortfolioForm();
  setupPricingForm();
  setupSettings();
}

// Boot
document.addEventListener("DOMContentLoaded", ()=>{
  ensureDefaults();
  setupLogin();
});
