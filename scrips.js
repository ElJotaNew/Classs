function calcular() {
    const angleInput = document.getElementById('angleInput');
    const angle = parseFloat(angleInput.value);
  
    if (isNaN(angle) || angle < 0 || angle > 360) {
      alert('Por favor ingresa un ángulo válido entre 0 y 360 grados.');
      return;
    }
  
    // Convertir grados a radianes
    const rad = angle * Math.PI / 180;
  
    const seno = Math.sin(rad);
    const coseno = Math.cos(rad);
    let tangente = Math.tan(rad);
  
    // Para ángulos donde tangente es muy grande (ejemplo 90 grados)
    if (Math.abs(coseno) < 1e-10) {
      tangente = 'Infinito';
    } else {
      tangente = tangente.toFixed(4);
    }
  
    document.getElementById('seno').innerHTML = `Seno(θ): <span style="color:#ff6e7f;">${seno.toFixed(4)}</span>`;
    document.getElementById('coseno').innerHTML = `Coseno(θ): <span style="color:#0b3d91;">${coseno.toFixed(4)}</span>`;
    document.getElementById('tangente').innerHTML = `Tangente(θ): <span style="color:#ffa500;">${tangente}</span>`;
  
    document.getElementById('results').style.display = 'block';
  
    // Rotar la línea para mostrar el ángulo
    const radiusLine = document.getElementById('radiusLine');
    radiusLine.style.transform = `rotate(${angle}deg)`;
  }
  