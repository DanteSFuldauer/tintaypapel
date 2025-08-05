let productosDB = [];

function mostrarModalCarrito() {
  const modal = document.getElementById("modal-carrito");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total-carrito");
  const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = "<p>No hay productos en el carrito.</p>";
    totalCarrito.textContent = "Total: $0.000";
  } else {
    let totalPrecio = 0;

    carrito.forEach(id => {
      const producto = productosDB.find(p => p.id === id);
      if (!producto) return;

      totalPrecio += producto.price;

      const item = document.createElement("div");
      item.className = "item-carrito";
      item.innerHTML = `
        <div class="info-libro">
          <strong>${producto.title}</strong><br>
          <em>${producto.author}</em>
        </div>
        <div class="precio-libro">$${producto.price.toLocaleString("es-AR")}</div>
      `;
      listaCarrito.appendChild(item);
    });

    totalCarrito.textContent = `Total: $${totalPrecio.toFixed(3)}`;
  }

  modal.style.display = "block";
}

function cerrarModal() {
  document.getElementById("modal-carrito").style.display = "none";
}

function manejarClicksModal(event) {
  const modal = document.getElementById("modal-carrito");
  if (event.target === modal || event.target.classList.contains("cerrar-modal")) {
    cerrarModal();
  }
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  const contador = document.getElementById("contador-carrito");

  if (contador) {
    contador.textContent = carrito.length > 9 ? "9+" : carrito.length;
    contador.style.display = carrito.length > 0 ? "flex" : "none";
  }
}

function agregarAlCarrito(idProducto) {
  let carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  carrito.push(idProducto);
  sessionStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function vaciarCarrito() {
  sessionStorage.removeItem("carrito");
  actualizarContadorCarrito();
  cerrarModal();
}

function pagar() {
  const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
  if (carrito.length === 0) return;

  const productosCompra = [];
  let totalCompra = 0;

  carrito.forEach(id => {
    const producto = productosDB.find(p => p.id === id);
    if (producto) {
      productosCompra.push({
        nombre: producto.title,
        precio: producto.price
      });
      totalCompra += producto.price;
    }
  });

  sessionStorage.setItem('productos', JSON.stringify(productosCompra));
  sessionStorage.setItem('total', totalCompra.toFixed(3));
  window.location.href = 'compra.html';
}

document.addEventListener("DOMContentLoaded", () => {
  const contenedorSwiper = document.getElementById("recomendados-container");

  fetch("https://openlibrary.org/search.json?q=javascript")
    .then(response => {
      if (!response.ok) throw new Error("Error en la red");
      return response.json();
    })
    .then(data => {
      const libros = data.docs.slice(0, 8);
      productosDB = libros.map(libro => {
        return {
          id: libro.key,
          title: libro.title,
          author: libro.author_name?.[0] || "Desconocido",
          year: libro.first_publish_year || "N/A",
          cover: libro.cover_i
            ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x200?text=Sin+Imagen",
          price: Math.floor(Math.random() * 40000 + 10000)
        };
      });

      contenedorSwiper.innerHTML = "";

      productosDB.forEach(producto => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.innerHTML = `
          <div class="card">
            <img src="${producto.cover}" alt="${producto.title}">
            <div class="card-content">
              <h3>${producto.title}</h3>
              <p>${producto.author}</p>
              <p>${producto.year}</p>
              <p>$${producto.price}</p>
            </div>
            <button class="comprar-btn" onclick="agregarAlCarrito('${producto.id}')">
              Añadir al carrito
            </button>
          </div>
        `;
        contenedorSwiper.appendChild(slide);
      });

      // Inicializar Swiper
      new Swiper(".mySwiper", {
        slidesPerView: 4,
        spaceBetween: 0,
        loop: true,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        breakpoints: {
          320: {slidesPerView: 2, spaceBetween: -50},
          768: { slidesPerView: 5, spaceBetween: 0},
        1024: { slidesPerView: 3, spaceBetween: 24 },
        1440: { slidesPerView: 4, spaceBetween: 32 },

        },
      });

      actualizarContadorCarrito();
    })
    .catch(error => {
      console.error("Error al obtener productos:", error);
      contenedorSwiper.innerHTML = "<p>Hubo un problema al cargar los productos.</p>";
    });

  document.querySelector(".user-actions")?.addEventListener("click", mostrarModalCarrito);
  document.getElementById("vaciar-carrito")?.addEventListener("click", vaciarCarrito);
  document.getElementById("pagar")?.addEventListener("click", pagar);
  window.addEventListener("click", manejarClicksModal);
});