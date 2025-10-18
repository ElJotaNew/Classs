(() => {
    'use strict';

    const STORAGE_KEY = 'pedidos_app_data';
    const STORAGE_ID_KEY = 'pedidos_app_next_id';

    // Estado
    let pedidos = [];
    let nextId = 1;

    // Elementos
    const form = document.getElementById('order-form');
    const inputProducto = form.producto;
    const inputCantidad = form.cantidad;
    const selectBodega = form.bodega;
    const ordersTableBody = document.querySelector('#orders-table tbody');

    // Validar datos (reutilizable)
    function validarProducto(valor) {
      return valor.trim().length > 0;
    }

    function validarCantidad(valor) {
      const n = Number(valor);
      return Number.isInteger(n) && n > 0;
    }

    function validarBodega(valor) {
      return ['Principal', 'Secundaria', 'Temporal'].includes(valor);
    }

    // Mostrar mensaje de error en el campo y estilos
    function setError(input, msg) {
      input.classList.add('invalid');
      const errDiv = input.parentElement.querySelector('.error-msg');
      errDiv.textContent = msg;
    }

    function clearError(input) {
      input.classList.remove('invalid');
      const errDiv = input.parentElement.querySelector('.error-msg');
      errDiv.textContent = '';
    }

    // Guardar datos en localStorage
    function guardarLocalStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
      localStorage.setItem(STORAGE_ID_KEY, nextId.toString());
    }

    // Cargar datos desde localStorage
    function cargarLocalStorage() {
      const datos = localStorage.getItem(STORAGE_KEY);
      const idNext = localStorage.getItem(STORAGE_ID_KEY);
      if (datos) {
        try {
          pedidos = JSON.parse(datos);
          if (!Array.isArray(pedidos)) pedidos = [];
        } catch {
          pedidos = [];
        }
      }
      if (idNext && !isNaN(idNext)) {
        nextId = Number(idNext);
      }
    }

    // Renderizar tabla
    function renderTabla() {
      ordersTableBody.innerHTML = '';
      if (pedidos.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.style.textAlign = 'center';
        td.textContent = 'No hay pedidos registrados.';
        tr.appendChild(td);
        ordersTableBody.appendChild(tr);
        return;
      }

      pedidos.forEach(pedido => {
        const tr = document.createElement('tr');
        tr.dataset.id = pedido.id;

        // ID
        const tdId = document.createElement('td');
        tdId.textContent = pedido.id;
        tdId.setAttribute('data-label', 'ID');
        tr.appendChild(tdId);

        // Producto (editable)
        const tdProducto = document.createElement('td');
        tdProducto.textContent = pedido.producto;
        tdProducto.classList.add('editable');
        tdProducto.setAttribute('data-label', 'Producto');
        tdProducto.tabIndex = 0;
        tr.appendChild(tdProducto);

        // Cantidad (editable)
        const tdCantidad = document.createElement('td');
        tdCantidad.textContent = pedido.cantidad;
        tdCantidad.classList.add('editable');
        tdCantidad.setAttribute('data-label', 'Cantidad');
        tdCantidad.tabIndex = 0;
        tr.appendChild(tdCantidad);

        // Bodega (editable)
        const tdBodega = document.createElement('td');
        tdBodega.textContent = pedido.bodega;
        tdBodega.classList.add('editable');
        tdBodega.setAttribute('data-label', 'Bodega');
        tdBodega.tabIndex = 0;
        tr.appendChild(tdBodega);

        // Acción (eliminar)
        const tdAccion = document.createElement('td');
        tdAccion.setAttribute('data-label', 'Acción');
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'action-btn delete';
        btnDelete.setAttribute('aria-label', `Eliminar pedido ID ${pedido.id}`);
        btnDelete.title = `Eliminar pedido ID ${pedido.id}`;
        btnDelete.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5a1 1 0 01-1 .5H8.5a1 1 0 01-1-.5L6 9zm5 2v7h2v-7h-2z"/>
          </svg>`;
        tdAccion.appendChild(btnDelete);
        tr.appendChild(tdAccion);

        ordersTableBody.appendChild(tr);
      });
    }

    // Añadir pedido al array y guardar
    function agregarPedido(producto, cantidad, bodega) {
      pedidos.push({ id: nextId++, producto, cantidad, bodega });
      guardarLocalStorage();
      renderTabla();
    }

    // Eliminar pedido por id
    function eliminarPedido(id) {
      pedidos = pedidos.filter(p => p.id !== id);
      guardarLocalStorage();
      renderTabla();
    }

    // Manejo de formulario - validación y submit
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      // Producto
      if (!validarProducto(inputProducto.value)) {
        setError(inputProducto, 'El producto no puede estar vacío.');
        valid = false;
      } else {
        clearError(inputProducto);
      }

      // Cantidad
      if (!validarCantidad(inputCantidad.value)) {
        setError(inputCantidad, 'Cantidad debe ser entero mayor que 0.');
        valid = false;
      } else {
        clearError(inputCantidad);
      }

      // Bodega (select requerido, pero por seguridad)
      if (!validarBodega(selectBodega.value)) {
        setError(selectBodega, 'Seleccione una bodega válida.');
        valid = false;
      } else {
        clearError(selectBodega);
      }

      if (!valid) return;

      agregarPedido(inputProducto.value.trim(), Number(inputCantidad.value), selectBodega.value);

      form.reset();
      inputProducto.focus();
    });

    // Confirmar y eliminar pedido al hacer clic en botón eliminar
    ordersTableBody.addEventListener('click', e => {
      if (e.target.closest('button.delete')) {
        const tr = e.target.closest('tr');
        const id = Number(tr.dataset.id);
        if (confirm(`¿Eliminar el pedido con ID ${id}? Esta acción no se puede deshacer.`)) {
          eliminarPedido(id);
        }
      }
    });

    // Edición inline
    let currentEditing = null;

    ordersTableBody.addEventListener('click', e => {
      const td = e.target.closest('td.editable');
      if (!td) return;
      if (currentEditing) return; // solo un campo a la vez

      currentEditing = td;
      const tr = td.parentElement;
      const id = Number(tr.dataset.id);
      const pedido = pedidos.find(p => p.id === id);

      let inputEl;
      const column = td.getAttribute('data-label');
      td.classList.add('editing');

      if (column === 'Producto') {
        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.value = pedido.producto;
        inputEl.setAttribute('aria-label', 'Editar producto');
      } else if (column === 'Cantidad') {
        inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.min = 1;
        inputEl.step = 1;
        inputEl.value = pedido.cantidad;
        inputEl.setAttribute('aria-label', 'Editar cantidad');
      } else if (column === 'Bodega') {
        inputEl = document.createElement('select');
        ['Principal', 'Secundaria', 'Temporal'].forEach(optionVal => {
          const option = document.createElement('option');
          option.value = optionVal;
          option.textContent = optionVal;
          if (optionVal === pedido.bodega) option.selected = true;
          inputEl.appendChild(option);
        });
        inputEl.setAttribute('aria-label', 'Editar bodega');
      } else {
        currentEditing = null;
        td.classList.remove('editing');
        return;
      }

      td.textContent = '';
      td.appendChild(inputEl);
      inputEl.focus();
      inputEl.select();

      // Mensaje de error visual en edición inline
      let errorShown = false;
      function mostrarError(msg) {
        td.classList.add('invalid');
        if (!errorShown) {
          const errorSpan = document.createElement('div');
          errorSpan.className = 'error-msg';
          errorSpan.textContent = msg;
          td.appendChild(errorSpan);
          errorShown = true;
        }
      }

      function limpiarError() {
        td.classList.remove('invalid');
        const err = td.querySelector('.error-msg');
        if (err) err.remove();
        errorShown = false;
      }

      function validarYGuardar() {
        let val = inputEl.value.trim();
        let valid = false;

        if (column === 'Producto') {
          valid = validarProducto(val);
          if (!valid) mostrarError('El producto no puede estar vacío.');
          else limpiarError();
        } else if (column === 'Cantidad') {
          valid = validarCantidad(val);
          if (!valid) mostrarError('Cantidad debe ser entero mayor que 0.');
          else limpiarError();
        } else if (column === 'Bodega') {
          valid = validarBodega(val);
          if (!valid) mostrarError('Bodega inválida.');
          else limpiarError();
        }

        if (!valid) return false;

        // Guardar cambios
        if (column === 'Producto') pedido.producto = val;
        else if (column === 'Cantidad') pedido.cantidad = Number(val);
        else if (column === 'Bodega') pedido.bodega = val;

        guardarLocalStorage();
        renderTabla();
        currentEditing = null;
        return true;
      }

      function cancelarEdicion() {
        currentEditing = null;
        renderTabla();
      }

      inputEl.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          if (validarYGuardar()) {
            inputEl.blur();
          }
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          cancelarEdicion();
        }
      });

      inputEl.addEventListener('blur', () => {
        validarYGuardar();
      });
    });

    // Inicializar
    cargarLocalStorage();
    renderTabla();

  })();