const products = [
  {id:'p1', name:'Tart Strawberry', price:28000, img:'assets/img/product1.jpg', review:'Creamy & segar, favorit pelanggan.'},
  {id:'p2', name:'Almond Brownies', price:24000, img:'assets/img/product2.jpg', review:'Lembut, legit, kacang almond wangi.'},
  {id:'p3', name:'Challah Loaf', price:35000, img:'assets/img/product3.jpg', review:'Roti empuk, manis-tipis, cocok sarapan.'},
  {id:'p4', name:'Supreme Croissant', price:22000, img:'assets/img/product4.jpg', review:'Lapisan renyah, krim lembut di dalam.'},
  {id:'p5', name:'Assorted Pastry', price:20000, img:'assets/img/product5.jpg', review:'Pilihan pastry harian yang cantik.'}
];

const state = {
  cart: [],
  testi: JSON.parse(localStorage.getItem('lm_testi')||'[]'),
  feedback: JSON.parse(localStorage.getItem('lm_feedback')||'[]')
};
const rupiah = n => 'Rp ' + n.toLocaleString('id-ID');
const el = (s,r=document)=> r.querySelector(s);
const els = (s,r=document)=> [...r.querySelectorAll(s)];

document.addEventListener('DOMContentLoaded', ()=>{
  renderSlider();
  renderProducts();
  renderTesti();
  renderCart();
  bindEvents();
  setInterval(()=> move(1), 6000);
});

let idx=0;
function renderSlider(){
  const wrap = el('#slider'); wrap.innerHTML='';
  products.slice(0,5).forEach(p=>{
    const s = document.createElement('div'); s.className='slide';
    s.innerHTML = `<img src="${p.img}" alt="${p.name}"><div class="slide-info"><h4>${p.name}</h4><p class="review">“${p.review}”</p><div class="price-actions"><strong class="price">${rupiah(p.price)}</strong><button class="btn small add" data-id="${p.id}">Tambah</button></div></div>`;
    wrap.appendChild(s);
  });
  renderDots();
  updateSlide();
  wrap.addEventListener('click', e=>{ const b = e.target.closest('.add'); if(b) addToCart(b.dataset.id); });
}
function renderDots(){
  const d=el('#dots'); d.innerHTML='';
  products.slice(0,5).forEach((_,i)=>{
    const b=document.createElement('button');
    b.addEventListener('click', ()=> go(i));
    d.appendChild(b);
  });
  updateDots();
}
function updateDots(){
  els('#dots button').forEach((b,i)=> b.classList.toggle('active', i===idx));
}
function go(i){ idx = (i + products.length) % products.length; updateSlide(); }
function move(n){ idx = (idx + n + products.length) % products.length; updateSlide(); }
function updateSlide(){
  el('#slider').style.transform = `translateX(-${idx*100}%)`;
  updateDots();
}

function renderProducts(){
  const grid = el('#productGrid'); grid.innerHTML='';
  products.forEach(p=>{
    const c = document.createElement('article'); c.className='card product-card';
    c.innerHTML = `<img src="${p.img}" alt="${p.name}"><h4>${p.name}</h4><p class="muted">${p.review}</p><div class="row"><span class="price">${rupiah(p.price)}</span><button class="btn small" data-add="${p.id}">Tambah</button></div>`;
    grid.appendChild(c);
  });
  grid.addEventListener('click', e=>{ const id = e.target.dataset.add; if(id) addToCart(id); });
}

function addToCart(id){
  const item = state.cart.find(i=>i.id===id);
  const p = products.find(x=>x.id===id);
  if(item) item.qty++; else state.cart.push({id:p.id,name:p.name,price:p.price,img:p.img,qty:1});
  renderCart(); openCart(true);
}
function changeQty(id,delta){
  const it = state.cart.find(i=>i.id===id); if(!it) return;
  it.qty += delta; if(it.qty<=0) state.cart = state.cart.filter(x=> x.id!==id);
  renderCart();
}
function renderCart(){
  const wrap = el('#cartItems'); wrap.innerHTML='';
  let total=0,count=0;
  state.cart.forEach(i=>{
    total += i.price*i.qty; count += i.qty;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `<img src="${i.img}" width="64" height="64" style="object-fit:cover;border-radius:8px"><div><strong>${i.name}</strong><div class="muted">${rupiah(i.price)}</div></div><div class="qty"><button data-q="-1" data-id="${i.id}">−</button><span>${i.qty}</span><button data-q="1" data-id="${i.id}">＋</button></div>`;
    wrap.appendChild(row);
  });
  el('#cartTotal').textContent = rupiah(total);
  el('#cartCount').textContent = count;
  el('#footerCount').textContent = count;
  wrap.onclick = e=>{ const b = e.target.closest('button[data-q]'); if(b) changeQty(b.dataset.id, parseInt(b.dataset.q,10)); };
}
function openCart(show){ el('#cartDrawer').classList.toggle('open', !!show); }

function checkout(){
  if(state.cart.length===0) return alert('Keranjang kosong');
  const lines = state.cart.map(i=>`- ${i.name} x${i.qty} = ${rupiah(i.price*i.qty)}`);
  const total = state.cart.reduce((a,b)=>a+b.price*b.qty,0);
  const msg = `Halo La Miel, saya ingin memesan:%0A${lines.join('%0A')}%0ATotal: ${rupiah(total)}%0AAlamat pengambilan: Jl. Rancamaya 87, Bogor`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
}

function renderTesti(){
  const wrap = el('#testiList'); wrap.innerHTML='';
  const base = state.testi.length?state.testi:[
    {nama:'Sari',rating:5,pesan:'Rasanya lembut dan elegant!'},
    {nama:'Widi',rating:5,pesan:'Packaging cantik, cocok jadi gift.'},
    {nama:'Dimas',rating:4,pesan:'Croissant berlapis, harumnya juara.'},
  ];
  base.forEach(t=>{
    const d = document.createElement('div'); d.className='testi';
    d.innerHTML = `<strong>${t.nama}</strong> <div class="stars">${'★'.repeat(t.rating)}</div><p>${t.pesan}</p>`;
    wrap.appendChild(d);
  });
}

function bindEvents(){
  el('#testiForm').addEventListener('submit', e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const data={nama:fd.get('nama'),rating:parseInt(fd.get('rating'),10),pesan:fd.get('pesan')};
    state.testi.push(data); localStorage.setItem('lm_testi', JSON.stringify(state.testi));
    e.target.reset(); renderTesti();
  });
  el('#feedbackForm').addEventListener('submit', e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const data={nama:fd.get('nama'),email:fd.get('email'),pesan:fd.get('pesan'),t:Date.now()};
    state.feedback.push(data); localStorage.setItem('lm_feedback', JSON.stringify(state.feedback));
    el('#feedbackInfo').textContent='Terima kasih! Masukan terkirim.';
    setTimeout(()=> el('#feedbackInfo').textContent='', 3000);
    e.target.reset();
  });
  el('#prev').addEventListener('click', ()=> move(-1));
  el('#next').addEventListener('click', ()=> move(1));
  el('#openCart').addEventListener('click', ()=> openCart(true));
  el('#closeCart').addEventListener('click', ()=> openCart(false));
  el('#checkoutBtn').addEventListener('click', checkout);
  el('#checkoutMain').addEventListener('click', checkout);
}