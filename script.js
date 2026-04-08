/**
 * CLASES DEL SISTEMA (Basado en Diagrama de Clases)
 */
class Usuario {
    constructor(id, nombre, email, password) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.puntos = 0;
    }
}

class Administrador extends Usuario {
    validarReciclaje(idRegistro) {
        const index = db.registros.findIndex(r => r.id === idRegistro);
        if (index !== -1) {
            const reg = db.registros.splice(index, 1)[0];
            // RF-07: Asignación automática de puntos
            db.usuarioActual.puntos += 10; 
            // RF-13: Notificación personalizada
            this.enviarNotificacion(`Reciclaje de ${reg.material} validado: +10 puntos.`);
            actualizarUI();
            renderAdminPanel(); // Refrescar lista
        }
    }
    enviarNotificacion(msj) {
        // En una app real esto usaría un sistema de notificaciones en UI, no alerts.
        alert("🔔 Notificación Eco: " + msj);
    }
}

// "Base de Datos" temporal
const db = {
    usuarios: [],
    usuarioActual: null,
    registros: [],
    recompensas: [
        { id: 1, nombre: "Curso Huerto Urbano Pro", pts: 30, empresa: "EcoEduca", icon: "fa-seedling" },
        { id: 2, nombre: "Bono Descuento Super", pts: 50, empresa: "Alianza Natural", icon: "fa-shopping-basket" },
        { id: 3, nombre: "Kit Reciclaje Doméstico", pts: 100, empresa: "Punto Verde Corp", icon: "fa-recycle" }
    ],
    centros: [
        { id: 1, nombre: "Punto Verde Centro", materiales: "PET, Vidrio", horario: "8:00 - 17:00", zona: "Norte" },
        { id: 2, nombre: "Ecopunto Industrial", materiales: "Metal, Papel", horario: "9:00 - 18:00", zona: "Sur" }
    ]
};

/**
 * LÓGICA DE ACCESO (NUEVO FLUJO)
 */
function loginInicial() {
    const n = document.getElementById("login-nombre").value;
    const e = document.getElementById("login-email").value;
    const p = document.getElementById("login-password").value;

    if(!n || !e || !p) return alert("Por favor complete todos los campos para iniciar.");

    // Crear sesión simulada con CUALQUIER dato
    db.usuarioActual = new Usuario(Date.now(), n, e, p);
    db.usuarios.push(db.usuarioActual);
    
    // Desbloquear Interfaz
    document.getElementById("login-overlay").classList.remove("active");
    document.getElementById("sidebar").classList.remove("hidden");
    document.getElementById("main-content").classList.remove("hidden");

    actualizarUI();
    mostrar('perfil'); // Ir al perfil por defecto
}

/**
 * ACCESO RESTRINGIDO AL ADMIN (NUEVA REGLA)
 */
function accesoAdmin() {
    const email = prompt("Ingrese correo de administrador:");
    const pass = prompt("Ingrese contraseña:");

    // Regla estricta solicitada
    if(email === "admin@puntoverde.com" && pass === "123") {
        alert("Acceso concedido al Panel Admin.");
        mostrar('admin');
    } else {
        alert("❌ Credenciales de administrador incorrectas. Acceso denegado.");
    }
}

function logout() {
    if(confirm("¿Seguro que desea salir del sistema?")) {
        location.reload(); // Reiniciar app
    }
}

/**
 * LÓGICA DE INTERFAZ Y NAVEGACIÓN
 */
function mostrar(id) {
    document.querySelectorAll(".card").forEach(c => c.classList.add("hidden"));
    const target = document.getElementById(id);
    target.classList.remove("hidden");
    target.classList.add("animate-in");

    // Cargas dinámicas
    if(id === 'catalogo') renderRecompensas();
    if(id === 'mapa') renderCentros();
    if(id === 'ranking') renderRanking();
    if(id === 'admin') renderAdminPanel();
}

function toggleEdit() {
    document.getElementById("edit-section").classList.toggle("hidden");
}

/**
 * RF-01/RF-03: GESTIÓN DE USUARIO
 */
function actualizarPerfil() {
    const nuevo = document.getElementById("edit-nombre").value;
    if(nuevo) {
        db.usuarioActual.nombre = nuevo;
        actualizarUI();
        toggleEdit();
        alert("Perfil actualizado. ¡Sigue reciclando!");
    }
}

function actualizarUI() {
    if(!db.usuarioActual) return;
    document.getElementById("info-nombre").innerText = db.usuarioActual.nombre;
    document.getElementById("info-email").innerText = db.usuarioActual.email;
    document.getElementById("puntos").innerText = db.usuarioActual.puntos;
    document.getElementById("status-nombre").innerText = db.usuarioActual.nombre;
}

/**
 * RF-04/RF-05: PROCESO DE RECICLAJE
 */
function registrarReciclaje() {
    const mat = document.getElementById("material").value;
    const cant = document.getElementById("cantidad").value;

    if(cant <= 0) return alert("Ingrese una cantidad válida mayor a cero.");

    const reg = { id: Date.now(), user: db.usuarioActual.nombre, material: mat, cant: cant };
    db.registros.push(reg);
    alert("🚀 Registro enviado. Un administrador validará tu entrega pronto para sumarte puntos.");
}

function renderAdminPanel() {
    const lista = document.getElementById("pendientes-admin");
    lista.innerHTML = db.registros.length === 0 ? "<p class='empty-state'><i class='fas fa-check-circle'></i> No hay validaciones pendientes.</p>" : "";
    
    db.registros.forEach(r => {
        const item = document.createElement("div");
        item.className = "admin-item animate-in";
        item.innerHTML = `
            <span><i class="fas fa-user-clock"></i> <strong>${r.user}</strong>: ${r.cant}kg de ${r.material}</span>
            <button onclick="validarAccion(${r.id})" class="btn-success btn-sm">Validar (RF-05)</button>
        `;
        lista.appendChild(item);
    });
}

function validarAccion(id) {
    const admin = new Administrador(); // Usar clase Admin para la validación
    admin.validarReciclaje(id);
}

/**
 * RF-08/RF-14: CATÁLOGO Y RANKING
 */
function renderRecompensas() {
    const grid = document.getElementById("lista-recompensas");
    grid.innerHTML = "";
    db.recompensas.forEach(r => {
        grid.innerHTML += `
            <div class="reward-card animate-in">
                <i class="fas ${r.icon} fa-2x reward-icon"></i>
                <h4>${r.nombre}</h4>
                <p class="empresa-label">${r.empresa}</p>
                <span class="pts-tag"><i class="fas fa-star"></i> ${r.pts} Puntos</span>
                <button onclick="canjear(${r.pts})" class="btn-primary btn-sm btn-block">Canjear Recompensa</button>
            </div>
        `;
    });
}

function canjear(costo) {
    if(db.usuarioActual.puntos >= costo) {
        db.usuarioActual.puntos -= costo; // RF-08: Canje
        actualizarUI();
        // RF-13: Notificación de canje exitoso
        alert("🎉 ¡Canje exitoso! Tu cupón digital ha sido generado. Revisa tu correo simulado.");
    } else {
        alert("❌ Puntos insuficientes. ¡Sigue reciclando para obtener esta recompensa!");
    }
}

function renderRanking() {
    const body = document.getElementById("body-ranking");
    body.innerHTML = "";
    // RF-14: Ranking dinámico ordenado
    const sorted = [...db.usuarios].sort((a,b) => b.puntos - a.puntos);
    sorted.forEach((u, i) => {
        const medal = i < 3 ? `<i class="fas fa-medal medal-${i+1}"></i>` : `#${i+1}`;
        body.innerHTML += `<tr><td>${medal}</td><td>${u.nombre}</td><td class="pts-col">${u.puntos} pts</td></tr>`;
    });
}

function renderCentros() {
    const lista = document.getElementById("lista-centros");
    lista.innerHTML = "";
    db.centros.forEach(c => {
        lista.innerHTML += `
            <div class="info-item animate-in">
                <strong><i class="fas fa-building"></i> ${c.nombre}</strong><br>
                <span>♻️ Materiales: ${c.materiales}</span><br>
                <span>⏰ Horario: ${c.horario}</span><br>
                <small class="zona-label">Zona ${c.zona}</small>
            </div>
        `;
    });
}

function generarReporteGeneral() {
    // RF-15: Reporte simulado
    alert(`📊 REPORTE GLOBAL DE IMPACTO (RF-15):\n----------------------------------\nTotal Eco-Líderes: ${db.usuarios.length}\nReciclajes Validados: 1.450 kg\nPuntos Emitidos: ${db.usuarios.reduce((acc, u) => acc + u.puntos, 0)} pts\nCo2 Ahorrado (Simulado): 3.2 Toneladas`);
}