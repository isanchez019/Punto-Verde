// MODELO DE DATOS SIMULADO (DB Temporal)
let db = {
    user: null,
    pendientes: []
};

let map;

// LOGIN Y REGISTRO INICIAL (RF-01)
function loginInicial() {
    const n = document.getElementById("login-nombre").value;
    const e = document.getElementById("login-email").value;
    const p = document.getElementById("login-password").value;

    if(n && e && p) {
        db.user = { 
            id: "ID-" + Math.floor(1000 + Math.random()*9000), // RF-01
            nombre: n, 
            email: e, 
            puntos: 0 
        };
        document.getElementById("login-overlay").style.display = "none";
        document.getElementById("app-structure").style.display = "block";
        actualizarUI();
        initMap(); // Inicializa el mapa real sin bloqueos
        renderAliados(); // 3 recompensas por aliado
        renderMapInfo(); // Nueva Info detallada debajo del mapa
    } else {
        alert("Por favor completa todos los datos para registrarte.");
    }
}

function actualizarUI() {
    document.getElementById("u-id").innerText = db.user.id;
    document.getElementById("u-nombre").innerText = db.user.nombre;
    document.getElementById("u-email").innerText = db.user.email;
    document.getElementById("u-puntos").innerText = db.user.puntos;
}

// MODIFICACIÓN DE DATOS (RF-03, Omitida anteriormente)
function toggleEdit() {
    const panel = document.getElementById("edit-panel");
    panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "block" : "none";
}

function guardarCambios() {
    const n = document.getElementById("edit-nombre").value;
    const e = document.getElementById("edit-email").value;
    if(n) db.user.nombre = n;
    if(e) db.user.email = e;
    actualizarUI();
    toggleEdit();
    alert("Datos actualizados correctamente.");
}

function mostrar(id) {
    document.querySelectorAll(".page-card").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
    // Refrescar Leaflet si se muestra el mapa
    if(id === 'mapa' && map) setTimeout(() => map.invalidateSize(), 200);
}

// MAPA REAL (Leaflet + CartoDB para evitar 403)
function initMap() {
    // Coordenadas de San Pedro de Montes de Oca
    map = L.map('real-map').setView([9.9333, -84.0500], 15);
    
    // CAMBIO CLAVE: Usamos CartoDB para evitar error 403 local (Referer)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(map);

    L.marker([9.9333, -84.0500]).addTo(map).bindPopup('Centro Norte');
    L.marker([9.9360, -84.0420]).addTo(map).bindPopup('Eco-Punto Sur');
    L.marker([9.9310, -84.0550]).addTo(map).bindPopup('Punto Express 24h');
}

// Nueva Info detallada debajo del mapa (RF-06 Solicitada)
function renderMapInfo() {
    const centros = [
        {h: "Centro Norte", t: "Metales/RAEE", ho: "L-V 7am-7pm", s: "open"},
        {h: "Eco-Punto Sur", t: "Plásticos/Vidrio", ho: "L-S 8am-6pm", s: "open"},
        {h: "Punto Express 24h", t: "Papel/Cartón", ho: "24/7", s: "maintenance"}
    ];
    document.getElementById("map-info-points").innerHTML = centros.map(c => `
        <div class="loc-card">
            <h4>${c.h}</h4>
            <p><strong>Tipo:</strong> ${c.t}</p>
            <p><strong>Horario:</strong> ${c.ho}</p>
            <span class="status-badge ${c.s}">${c.s === 'open' ? 'Abierto' : 'Mantenimiento'}</span>
        </div>
    `).join('');
}

// ALIADOS Y RECOMPENSAS CON CÓDIGO ÚNICO (3 por Socio, RF-08/09)
function renderAliados() {
    const aliados = [
        {e: "Súper La Cosecha", items: [{n:"Vale compra 10%", p:80}, {n:"Pack Frutas Eco", p:120}, {n:"Bolsa Reutilizable", p:30}]},
        {e: "Ferretería El Clavo", items: [{n:"Kit Herramientas", p:350}, {n:"Bombillas LED (x2)", p:60}, {n:"Pintura Base Agua", p:180}]},
        {e: "Mascotas Huellitas", items: [{n:"Baño Estético", p:90}, {n:"Juguete Caucho", p:40}, {n:"Consulta Vet", p:220}]},
        {e: "Instituto TecnoMente", items: [{n:"Beca Curso Excel", p:500}, {n:"Taller Reparación PC", p:250}, {n:"Certificación Pro", p:800}]}
    ];
    
    document.getElementById("aliados-grid").innerHTML = aliados.map(a => `
        <div class="partner-card">
            <h3>${a.e}</h3>
            ${a.items.map(i => `
                <div class="reward-item">
                    <span>${i.n}</span>
                    <button class="btn-orange-glow" style="padding:6px 12px; width:auto; margin:0; font-size:0.85rem" onclick="canjearRecompensa(${i.p}, '${i.n}')">${i.p} Pts</button>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// CANJE CON GENERACIÓN DE CÓDIGO ÚNICO (RF-08 Solicitada)
function canjearRecompensa(costo, nombrePremio) {
    if(db.user.puntos >= costo) {
        // Validación y descuento
        db.user.puntos -= costo;
        actualizarUI();
        
        // Generación de Código Único
        const codigoUnico = `RECOMP-${Math.floor(1000 + Math.random()*9000)}-PV`;
        
        // Confirmación con Código
        alert(`¡Canje exitoso!\\nPremio: ${nombrePremio}\\nCódigo Único de Canje: ${codigoUnico}\\nPreséntalo en el establecimiento aliado.`);
    } else {
        alert("Puntos insuficientes para este beneficio.");
    }
}

// GESTIÓN DE RECICLAJE (RF-04)
function ejecutarRegistro() {
    const cant = document.getElementById("r-cantidad").value;
    if(cant > 0) {
        // Registro de Solicitud con ID Usuario
        db.pendientes.push({ id: Date.now(), user: db.user.id, peso: cant });
        alert("Solicitud de reciclaje enviada al Admin para validación.");
        mostrar('perfil');
    } else {
        alert("Ingrese una cantidad válida.");
    }
}

// PANEL ADMIN (RF-05, Clave: 123)
function accesoAdmin() {
    const pass = prompt("Clave de Administrador:");
    if(pass === "123") {
        mostrar('admin');
        renderAdmin();
    } else {
        alert("Clave incorrecta.");
    }
}

// VALIDACIÓN ADMIN (RF-05, RF-07)
function renderAdmin() {
    const cont = document.getElementById("lista-pendientes");
    if(db.pendientes.length === 0) cont.innerHTML = "<p>No hay solicitudes pendientes.</p>";
    else cont.innerHTML = db.pendientes.map(p => `
        <div class="admin-item">
            <div class="admin-info">
                <strong>Usuario: ${p.user}</strong><br>
                <span>Peso Solicitado: ${p.peso} Kg</span>
            </div>
            <button onclick="validarEntrega(${p.id})" style="background:var(--primary); color:white; border:none; padding:10px; border-radius:12px; cursor:pointer">VALIDAR</button>
        </div>
    `).join('');
}

function validarEntrega(id) {
    // Aprobación y suma automática de puntos
    db.user.puntos += 100; // Asignación automática RF-07
    db.pendientes = db.pendientes.filter(x => x.id !== id);
    actualizarUI();
    renderAdmin();
    alert("¡Actividad validada! Puntos asignados automáticamente.");
}
