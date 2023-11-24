//Variables

let cliente = {
  mesa: "",
  hora: "",
  pedido: [],
};

const categorias = {
  1: "Comida",
  2: "Bebidas",
  3: "Postres",
};

// Selectores
const btnGuardarCliente = document.querySelector("#guardar-cliente");

// EventListeners
document.addEventListener("DOMContentLoaded", () => {
  btnGuardarCliente.addEventListener("click", guardarCliente);
});

// Funciones

function guardarCliente() {
  const mesa = document.querySelector("#mesa").value;
  const hora = document.querySelector("#hora").value;

  // Validar --- OTRA FORMA DE VALIDAR SI ESTAN VACIOS O NO
  const camposVacios = [mesa, hora].some((campo) => campo === "");

  if (camposVacios) {
    mostrarAlerta("Todos los campos son obligatorios");
    return;
  }

  // Asignar datos formulario al cliente
  cliente = { ...cliente, mesa, hora };

  // Ocultar Modal
  const modalFormulario = document.querySelector("#formulario");
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  // Consultar API json-server

  obtenerPlatillos();

  // Mostrar Seccion

  mostrarSecciones();
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll(".d-none");

  seccionesOcultas.forEach((seccion) => {
    seccion.classList.remove("d-none");
  });
}

function obtenerPlatillos() {
  const url = "http://localhost:4000/platillos";

  fetch(url)
    .then((resultado) => resultado.json())
    .then((datos) => {
      mostrarPlatillos(datos);
    })
    .catch((error) => console.log(error));
}

function mostrarPlatillos(platillos) {
  const contenido = document.querySelector("#platillos .contenido");

  platillos.forEach((platillo) => {
    const { precio, nombre, id, categoria } = platillo;

    const row = document.createElement("div");
    row.classList.add("row", "py-3", "border-top");

    const nombreDiv = document.createElement("div");
    nombreDiv.classList.add("col-md-4", "col-4");
    nombreDiv.textContent = nombre;

    const precioDiv = document.createElement("div");
    precioDiv.classList.add("col-md-3", "col-3", "fw-bold");
    precioDiv.textContent = `$${precio}`;

    const categoriaDiv = document.createElement("div");
    categoriaDiv.classList.add("col-md-3", "col-3");
    categoriaDiv.textContent = categorias[categoria];

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.value = 0;
    inputCantidad.min = 0;
    inputCantidad.id = `producto-${id}`;
    inputCantidad.classList.add("form-control");

    //Funcion que detecta la cantidad y platillo que se estan agregando
    inputCantidad.onchange = (e) => {
      const cantidad = parseInt(e.target.value);
      agregarPlatillo({ ...platillo, cantidad });
    };

    const cantidadDiv = document.createElement("div");
    cantidadDiv.classList.add("col-md-2", "col-2");
    cantidadDiv.appendChild(inputCantidad);

    row.appendChild(nombreDiv);
    row.appendChild(precioDiv);
    row.appendChild(categoriaDiv);
    row.appendChild(cantidadDiv);

    contenido.appendChild(row);
  });
}

function agregarPlatillo(producto) {
  // Extraer el pedido actual

  let { pedido } = cliente;

  // Revisar Cantidad mayor a 0
  if (producto.cantidad > 0) {
    //Comprueba si el elemento ya existe en el arreglo
    if (pedido.some((obj) => obj.id === producto.id)) {
      //Actualizar la cantidad
      const pedidoActualizado = pedido.map((articulo) => {
        if (articulo.id === producto.id) {
          articulo.cantidad = producto.cantidad;
        }
        return articulo;
      });

      // Se asigna el nuevo array a cliente.pedido
      cliente.pedido = [...pedidoActualizado];
    } else {
      // El articulo no existe
      cliente.pedido = [...pedido, producto];
    }
  } else {
    // Eliminar elementos al tener una cantidad de 0
    const resultado = pedido.filter((articulo) => articulo.id !== producto.id);

    cliente.pedido = [...resultado];
  }

  // Limipiar HTML
  limipiarHTML();

  if (cliente.pedido.length) {
    //Mostrar el Resumen
    actualizarResumen();
  } else {
    pedidoMensajeVacio();
  }
}

function actualizarResumen() {
  const contenido = document.querySelector("#resumen .contenido");

  const resumen = document.createElement("div");
  resumen.classList.add("col-md-6", "card", "py-3", "px-3", "shadow");

  // Informacion Mesa
  const mesa = document.createElement("p");
  mesa.textContent = `Mesa: `;
  mesa.classList.add("fw-bold");

  const mesaSpan = document.createElement("span");
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add("fw-normal");

  // Informacion Hora
  const hora = document.createElement("p");
  hora.textContent = `Hora: `;
  hora.classList.add("fw-bold");

  const horaSpan = document.createElement("span");
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add("fw-normal");

  // Titulo de la seccion
  const heading = document.createElement("h3");
  heading.textContent = "Platillos Consumidos";
  heading.classList.add("my-4", "text-center");

  // Iterar sobre el array del pedido
  const grupo = document.createElement("ul");
  grupo.classList.add("list-group");

  const { pedido } = cliente;

  pedido.forEach((articulo) => {
    const { precio, nombre, id, cantidad } = articulo;

    const listaArticulos = document.createElement("li");
    listaArticulos.classList.add("list-group-item");

    const nombreArticulo = document.createElement("h4");
    nombreArticulo.classList.add("my-4");
    nombreArticulo.textContent = nombre;

    const cantidadArticulo = document.createElement("p");
    cantidadArticulo.classList.add("fw-bold");
    cantidadArticulo.textContent = "Cantidad: ";

    const cantidadSpan = document.createElement("span");
    cantidadSpan.textContent = cantidad;
    cantidadSpan.classList.add("fw-normal");

    const precioArticulo = document.createElement("p");
    precioArticulo.classList.add("fw-bold");
    precioArticulo.textContent = "Precio: $";

    const precioSpan = document.createElement("span");
    precioSpan.textContent = precio;
    precioSpan.classList.add("fw-normal");

    const subtotal = document.createElement("p");
    subtotal.classList.add("fw-bold");
    subtotal.textContent = "Subtotal: $";

    const subtotalSpan = document.createElement("span");
    subtotalSpan.textContent = calcularSubtotal(precio, cantidad);
    subtotalSpan.classList.add("fw-normal");

    //Boton eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("btn", "btn-danger");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = function () {
      eliminarProducto(id);
    };

    cantidadArticulo.appendChild(cantidadSpan);
    precioArticulo.appendChild(precioSpan);
    subtotal.appendChild(subtotalSpan);

    // Agregar a la lista
    listaArticulos.appendChild(nombreArticulo);
    listaArticulos.appendChild(cantidadArticulo);
    listaArticulos.appendChild(precioArticulo);
    listaArticulos.appendChild(subtotal);
    listaArticulos.appendChild(btnEliminar);

    // Agregar a grupo
    grupo.appendChild(listaArticulos);
  });

  // Insertar HTML
  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  resumen.appendChild(heading);
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(grupo);

  contenido.appendChild(resumen);

  // Mostrar formulario de propinas
  formularioPropinas();
}

function formularioPropinas() {
  const contenido = document.querySelector("#resumen .contenido");

  const formulario = document.createElement("div");
  formulario.classList.add("col-md-6", "formulario");

  const divFormulario = document.createElement("div");
  divFormulario.classList.add("card", "py-3", "px-3", "shadow");

  const heading = document.createElement("h3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = "Propina";

  // Radio button 10
  const radio10 = document.createElement("input");
  radio10.type = "radio";
  radio10.name = "propina";
  radio10.value = "10";
  radio10.classList.add("form-check-input");
  radio10.onclick = calcularPropina;

  const radio10Label = document.createElement("label");
  radio10Label.textContent = "10%";
  radio10Label.classList.add("form-check-label");

  const radio10Div = document.createElement("div");
  radio10Div.classList.add("form-check");

  // Radio button 25
  const radio25 = document.createElement("input");
  radio25.type = "radio";
  radio25.name = "propina";
  radio25.value = "25";
  radio25.classList.add("form-check-input");
  radio25.onclick = calcularPropina;

  const radio25Label = document.createElement("label");
  radio25Label.textContent = "25%";
  radio25Label.classList.add("form-check-label");

  const radio25Div = document.createElement("div");
  radio25Div.classList.add("form-check");

  // Radio button 50
  const radio50 = document.createElement("input");
  radio50.type = "radio";
  radio50.name = "propina";
  radio50.value = "50";
  radio50.classList.add("form-check-input");
  radio50.onclick = calcularPropina;

  const radio50Label = document.createElement("label");
  radio50Label.textContent = "50%";
  radio50Label.classList.add("form-check-label");

  const radio50Div = document.createElement("div");
  radio50Div.classList.add("form-check");

  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Label);
  radio25Div.appendChild(radio25);
  radio25Div.appendChild(radio25Label);
  radio50Div.appendChild(radio50);
  radio50Div.appendChild(radio50Label);

  divFormulario.appendChild(heading);
  divFormulario.appendChild(radio10Div);
  divFormulario.appendChild(radio25Div);
  divFormulario.appendChild(radio50Div);

  formulario.appendChild(divFormulario);

  contenido.appendChild(formulario);
}

function eliminarProducto(id) {
  const { pedido } = cliente;

  const resultado = pedido.filter((articulo) => articulo.id !== id);

  cliente.pedido = [...resultado];

  //

  limipiarHTML();

  if (cliente.pedido.length) {
    //Mostrar el Resumen
    actualizarResumen();
  } else {
    pedidoMensajeVacio();

    reiniciarCantidad(id);
  }
}

function reiniciarCantidad(id) {
  const cantidades = document.querySelectorAll("#platillos .form-control");
  cantidades.forEach((cantidad) => {
    if (cantidad.id == `producto-${id}`) {
      cantidad.value = 0;
    }
  });
}

function calcularPropina() {
  const { pedido } = cliente;
  let subtotal = 0;

  // Calular subtotal
  pedido.forEach((articulo) => {
    subtotal += articulo.cantidad * articulo.precio;
  });

  // Seleccionar radiobutton
  const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

  // Calcular propina
  const propina = (parseInt(propinaSeleccionada) * subtotal) / 100;

  // Total completo

  const totalConPropina = subtotal + propina;

  //Limpiar propina

  mostrarTotalHTML(subtotal, totalConPropina, propina);
}

function calcularSubtotal(precio, cantidad) {
  return precio * cantidad;
}

function mostrarAlerta(mensaje) {
  const existeAlerta = document.querySelector("invalid-feedback");
  if (!existeAlerta) {
    const alerta = document.createElement("div");
    alerta.classList.add("invalid-feedback", "d-block", "text-center");
    alerta.textContent = mensaje;

    document.querySelector(".modal-body form").appendChild(alerta);

    setTimeout(() => {
      alerta.remove();
    }, 3000);
  }
}

function mostrarTotalHTML(subtotal, totalConPropina, propina) {

    limpiarFormulario();

    const formulario = document.querySelector("#resumen .contenido .formulario");

    const totales = document.createElement("div");
    totales.classList.add("total-pagar", "card", "py-3", "px-3", "shadow");

    // Subtotal
    const subtotalParrafo = document.createElement("p");
    subtotalParrafo.classList.add("fs-4", "fw-bold", "mt-3");
    subtotalParrafo.textContent = "Subtotal Consumo: $";

    const subtotalSpan = document.createElement("span");
    subtotalSpan.classList.add("fw-normal");
    subtotalSpan.textContent = subtotal;

    // Propina
    const propinaParrafo = document.createElement("p");
    propinaParrafo.classList.add("fs-4", "fw-bold", "mt-3");
    propinaParrafo.textContent = "Propina: $";

    const propinaSpan = document.createElement("span");
    propinaSpan.classList.add("fw-normal");
    propinaSpan.textContent = propina;

    // Propina
    const totalPropinaParrafo = document.createElement("p");
    totalPropinaParrafo.classList.add("fs-4", "fw-bold", "mt-3");
    totalPropinaParrafo.textContent = "Total: $";

    const totalPropinaSpan = document.createElement("span");
    totalPropinaSpan.classList.add("fw-normal");
    totalPropinaSpan.textContent = totalConPropina;

    subtotalParrafo.appendChild(subtotalSpan);
    propinaParrafo.appendChild(propinaSpan);
    totalPropinaParrafo.appendChild(totalPropinaSpan);

    totales.appendChild(subtotalParrafo);
    totales.appendChild(propinaParrafo);
    totales.appendChild(totalPropinaParrafo);

    formulario.appendChild(totales);
}

function pedidoMensajeVacio() {
  const contenido = document.querySelector("#resumen .contenido");
  const texto = document.createElement("p");
  texto.classList.add("text-center"),
    (texto.textContent = "Añade los elementos del pedido");

  contenido.appendChild(texto);
}

function limpiarFormulario() {
    const formulario = document.querySelector(".total-pagar");

    if (formulario) {
            formulario.remove();
    }
}

function limipiarHTML() {
  const contenido = document.querySelector("#resumen .contenido");
  while (contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  }
}
