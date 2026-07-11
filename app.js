import { productos } from "./data/productos.js";
import { categorias } from "./data/categorias.js";

console.log(categorias);

console.log(productos);

lucide.createIcons();

// ---- TABS ---- RENDERS

function renderTabs() {
  const tabsContainer = document.getElementById("tabs-container");

  tabsContainer.innerHTML = categorias.map((categoria, index) => `
    <button
      class="tab ${index === 0 ? "tab--active" : ""}"
      data-cat="${categoria.id}"
    >
      ${categoria.nombre}
    </button>
  `).join("");
}
function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t =>
        t.classList.remove('tab--active')
      );

      btn.classList.add('tab--active');
      showTab(btn.dataset.cat);
    });
  });
}


document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
    btn.classList.add('tab--active');
    showTab(btn.dataset.cat);
  });
});

function showTab(cat) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('tab--active', t.dataset.cat === cat);
  });

  renderProductos(cat);
}

function renderProductos(categoriaSeleccionada = null) {
  const container = document.getElementById("productos-container");

  const categoriasAMostrar = categoriaSeleccionada
  ? categorias.filter(c => c.id === categoriaSeleccionada)
  : categorias;

  container.innerHTML = categoriasAMostrar.map(categoria => {

    const productosCategoria = productos.filter(
      producto => producto.categoria === categoria.id
    );

    return `
      <div class="menu-category">
        <h2 class="category-title">${categoria.nombre}</h2>

        ${productosCategoria.map(producto => `
          <div class="product-card">
            <div class="product-main-row">
              <img
                src="${producto.imagen}"
                alt="${producto.nombre}"
                class="product-img"
              />

              <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <span class="product-price">
                  $${producto.precio.toLocaleString("es-AR")}
                </span>
                <button class="btn-agregar" data-id="${producto.id}">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        `).join("")}

      </div>
    `;
  }).join("");

  document.querySelectorAll(".btn-agregar").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
    });
  });
}



// ---- CARRITO ----
let cart = {};

function addToCart(id) {

  const producto = productos.find(p => p.id == id);

  if (!producto) return;

  const name = producto.nombre;
  const price = producto.precio;
  const img = producto.imagen;

  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = {
      name,
      price,
      img,
      qty: 1
    };
  }

  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  renderCart();
}

function renderCart() {
  const items = Object.entries(cart);
  const badge = document.getElementById('cart-badge');
  const cartItemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const waBtn = document.getElementById('btn-whatsapp');

  const totalQty = items.reduce((s, [, v]) => s + v.qty, 0);
  const totalPrice = items.reduce((s, [, v]) => s + v.price * v.qty, 0);

  badge.textContent = totalQty;
  badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';

  if (items.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío 🛒</p>';
  } else {
    cartItemsEl.innerHTML = items.map(([id, item]) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${item.price.toLocaleString('es-AR')}</span>
        </div>
        <div class="cart-item-controls">
          <button onclick="changeQty('${id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${id}', 1)">+</button>
          <button class="cart-item-delete" onclick="removeItem('${id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `).join('');
  }

  totalEl.textContent = '$' + totalPrice.toLocaleString('es-AR');

  // 1. Reemplazamos el viejo link directo por el '#' para frenarlo
  waBtn.href = "#";

  // 2. Mantenemos tu lógica espectacular de actualizar los contadores en las tarjetas
  document.querySelectorAll('.product-card').forEach(card => {
    const id = card.dataset.id;
    const btnContainer = card.querySelector('.btn-container-dinamico');
    
    if (!btnContainer) return; 

    const item = cart[id];

    if (item && item.qty > 0) {
      btnContainer.innerHTML = `
        <div class="card-control-wrapper">
          <div class="card-control-qty">
            <button class="btn-qty-minus" onclick="changeQty('${id}', -1)">−</button>
            <span class="card-qty-num">${item.qty}</span>
            <button class="btn-qty-plus" onclick="changeQty('${id}', 1)">+</button>
          </div>
          <button class="btn-card-delete" onclick="removeItem('${id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
    } else {
      btnContainer.innerHTML = `
        <button class="btn-agregar" onclick="addToCart(this)">
          <i data-lucide="shopping-cart"></i> Agregar
        </button>
      `;
    }
  });

  lucide.createIcons();
}

const modal = document.getElementById('checkout-modal');

// Abre el cuadro cuando tocan "Enviar pedido"
document.getElementById('btn-whatsapp').addEventListener('click', (e) => {
  e.preventDefault();
  if (Object.keys(cart).length === 0) return;
  modal.style.display = 'flex';
});

// Botón cancelar del cuadro
document.getElementById('btn-close-modal').addEventListener('click', () => {
  modal.style.display = 'none';
});

// Oculta campos si es Retiro en Local
function toggleDeliveryFields() {
  const method = document.getElementById('delivery-method').value;
  const fields = document.getElementById('delivery-fields');
  const addressInput = document.getElementById('customer-address');
  
  if (method === 'pickup') {
    fields.style.display = 'none';
    addressInput.removeAttribute('required');
  } else {
    fields.style.display = 'block';
    addressInput.setAttribute('required', 'required');
  }
}

// 🆕 Nueva función para mostrar/ocultar el campo de efectivo
function togglePaymentFields() {
  const method = document.getElementById('payment-method').value;
  const cashFields = document.getElementById('cash-fields');
  const cashInput = document.getElementById('cash-amount');
  
  if (method === 'Efectivo') {
    cashFields.style.display = 'block';
    cashInput.setAttribute('required', 'required');
  } else {
    cashFields.style.display = 'none';
    cashInput.removeAttribute('required');
    cashInput.value = ''; // Limpia el campo si vuelven a transferencia
  }
}

// Envía todo procesado a WhatsApp
// Envía todo procesado a WhatsApp
document.getElementById('form-checkout').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('customer-name').value;
  const method = document.getElementById('delivery-method').value;
  const address = document.getElementById('customer-address').value;
  const notes = document.getElementById('customer-notes').value;
  const payment = document.getElementById('payment-method').value;

  const items = Object.entries(cart);
  const totalPrice = items.reduce((s, [, v]) => s + v.price * v.qty, 0);

  // 1. Armamos los productos con la pizza
  const msgProductos = items.map(([, v]) => `🍕 *${v.name}* x${v.qty} = $${(v.price * v.qty).toLocaleString('es-AR')}`).join('\n');
  
  // 2. 🆕 Lógica para armar la forma de pago con el vuelto si es efectivo
  let detallePago = payment;
  if (payment === 'Efectivo') {
    const cashAmount = parseInt(document.getElementById('cash-amount').value) || 0;
    const vuelto = cashAmount - totalPrice;
    
    if (vuelto >= 0) {
      detallePago = `Efectivo (Paga con: $${cashAmount.toLocaleString('es-AR')} | Vuelto: $${vuelto.toLocaleString('es-AR')})`;
    } else {
      detallePago = `Efectivo (Paga justo o monto menor indicado: $${cashAmount.toLocaleString('es-AR')})`;
    }
  }

  // 3. Armamos los datos del cliente con todos los emojis
  let msgCliente = `*Datos de Entrega:*\n👤 *Nombre:* ${name}\n🛵 *Método:* ${method === 'delivery' ? 'Envío a domicilio' : 'Retiro por el local'}`;
  
  if (method === 'delivery') {
    msgCliente += `\n📍 *Dirección:* ${address}`;
    if (notes) msgCliente += `\nℹ️ *Aclaraciones:* ${notes}`;
  }
  
  // 🆕 Acá inyectamos el nuevo detalle del pago con el vuelto
  msgCliente += `\n💳 *Pago:* ${detallePago}`;

  // 4. Unimos todo el mensaje
  const mensajeTextoPlano = `🏪 *NUEVO PEDIDO - LA NONNA*\n\n${msgCliente}\n\n🛒 *Detalle del Pedido:*\n${msgProductos}\n\n💰 *Total a pagar: $${totalPrice.toLocaleString('es-AR')}*`;

  // Codificamos TODO el texto junto para que los emojis viajen seguros
  const mensajeCodificado = encodeURIComponent(mensajeTextoPlano);

  const telefonoNegocio = "5491161038373"; 

  // Abrimos la URL con el mensaje blindado
  window.open(`https://wa.me/${telefonoNegocio}?text=${mensajeCodificado}`, '_blank');
  modal.style.display = 'none';
});

// Toggle carrito manual
document.getElementById('cart-toggle').addEventListener('click', () => {
  const body = document.getElementById('cart-body');
  const icon = document.getElementById('chevron-icon');
  const open = body.style.display !== 'none' && body.style.display !== '';
  body.style.display = open ? 'none' : 'block';
  icon.setAttribute('data-lucide', open ? 'chevron-up' : 'chevron-down');
  lucide.createIcons();
});

renderTabs();
initTabs();
renderCart();
renderProductos();