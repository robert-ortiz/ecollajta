// Referencias a elementos
const tabButtons = document.querySelectorAll('.tab-button');
const tabPages = document.querySelectorAll('.tab-page');
const messageModal = document.getElementById('message-modal');
const modalContent = messageModal.querySelector('.bg-white');
const modalText = document.getElementById('modal-text');

// Variables para el Mapa Leaflet
const COCHABAMBA_COORDS = [-17.3932, -66.1568]; 
const DEFAULT_ZOOM = 13;
let mapInitialized = false; 
let mymap = null; 

// PUNTOS DE ACOPIO ESTRATÉGICOS (Puntos Verdes - Orgánicos/Reciclables)
const acopioPoints = [
    { name: "Punto Verde Pacata", coords: [-17.3600, -66.1250], description: "Frente a la Estación G&G. Reciclables y Orgánicos." },
    { name: "Punto Verde Parada 109 (Temporal)", coords: [-17.3900, -66.2000], description: "Área temporal de la Parada 109. Enfocado en Reciclables." },
    { name: "Punto Verde 2da Circunvalación", coords: [-17.4050, -66.1150], description: "Frente a la Estación Cochabamba II." },
    { name: "Punto Verde Stadium", coords: [-17.3980, -66.1600], description: "Av. Humboldt acera sur. Punto de alto tráfico." },
    { name: "Punto Verde Capitán Ustariz", coords: [-17.4120, -66.2100], description: "Km 6. Foco en materiales secos." },
    { name: "Punto Verde Tránsito", coords: [-17.4000, -66.1750], description: "Av. Sajama y Complejo Ex-Toyocar. Contenedores soterrados." }
];

// PUNTOS DE DEPÓSITO DE RESIDUOS GENERALES (Basureros Zonales / Gran Magnitud)
const discardPoints = [
    { name: "Basurero Zonal Rosales", coords: [-17.369346, -66.144056], description: "Depósito de residuos generales. Evitar reciclables y orgánicos." },
    { name: "Basurero Zonal Colquiri Sud", coords: [-17.364509, -66.178701], description: "Depósito de residuos generales. Operación de gran magnitud." },
    { name: "Basurero Zonal Av. Libertador", coords: [-17.380368, -66.160564], description: "Ubicado en la Av. Libertador Simón Bolívar." }
];

// PUNTOS HÍBRIDOS (Acopio + Descarte)
const hybridPoints = [
    { name: "Kalo's RESTAURANTE", coords: [-17.402516, -66.156656], description: "Punto de recolección de aceite vegetal usado (reciclaje) y basurero zonal." } // NUEVO PUNTO
];

// --- LÓGICA DE INCENTIVOS (AÑADIDO) ---
const userIncentives = {
    points: 1580,
    level: "Eco-Activista II",
    nextLevelPoints: 2000,
    transactions: [
        { date: "24/11/2025", type: "Reciclaje PET", points: "+150", status: "Completado" },
        { date: "20/11/2025", type: "Canje: Bolsa Abono", points: "-500", status: "Canjeado" },
        { date: "15/11/2025", type: "Orgánicos compostaje", points: "+200", status: "Completado" },
        { date: "10/11/2025", type: "Reciclaje Cartón", points: "+100", status: "Completado" },
    ]
};

// Función para actualizar la UI del incentivo (AÑADIDO)
function updateIncentiveUI() {
    // Referencias a elementos que deben estar en index.html
    const pointsElement = document.getElementById('user-points-display');
    const levelElement = document.getElementById('user-level-display');
    const historyBody = document.getElementById('transaction-history-body');

    if (pointsElement) pointsElement.textContent = userIncentives.points.toLocaleString();
    if (levelElement) levelElement.textContent = userIncentives.level;
    
    if (historyBody) {
        historyBody.innerHTML = ''; // Limpiar historial
        
        userIncentives.transactions.forEach(tx => {
            const row = document.createElement('tr');
            const pointsClass = tx.points.startsWith('+') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
            
            row.innerHTML = `
                <td class="py-2 px-4 whitespace-nowrap text-sm text-gray-500">${tx.date}</td>
                <td class="py-2 px-4 whitespace-nowrap text-sm font-medium text-gray-900">${tx.type}</td>
                <td class="py-2 px-4 whitespace-nowrap text-sm ${pointsClass}">${tx.points}</td>
                <td class="py-2 px-4 whitespace-nowrap text-sm text-gray-500">${tx.status}</td>
            `;
            historyBody.appendChild(row);
        });
    }
}


// --- DEFINICIÓN DE ICONOS PERSONALIZADOS ---

// ICONO ROJO para Basureros Zonales (Descarte)
const RedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ICONO NARANJA para Puntos Híbridos (Combinación)
const OrangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- FUNCIONES DE MAPA ---

function initMap() {
    if (mymap) {
        mymap.invalidateSize();
        return;
    }

    mymap = L.map('mapid').setView(COCHABAMBA_COORDS, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mymap);

    // Añadir todos los tipos de marcadores
    addAcopioMarkers(mymap);
    addDiscardMarkers(mymap);
    addHybridMarkers(mymap);
}

// Función para añadir Puntos de Acopio (Puntos Verdes - Icono Azul/Predeterminado)
function addAcopioMarkers(mapInstance) {
    acopioPoints.forEach(point => {
        const marker = L.marker(point.coords).addTo(mapInstance);
        marker.bindPopup(`
            <h4 class="font-bold text-blue-700">🔵 ${point.name}</h4>
            <p class="text-sm">Tipo: **Punto Verde**</p>
            <p class="text-xs mt-1">${point.description}</p>
        `);
    });
}

// Función: Añadir Basureros Zonales (Icono Rojo)
function addDiscardMarkers(mapInstance) {
    discardPoints.forEach(point => {
        const marker = L.marker(point.coords, { icon: RedIcon }).addTo(mapInstance);
        marker.bindPopup(`
            <h4 class="font-bold text-red-700">🔴 ${point.name}</h4>
            <p class="text-sm">Tipo: **Basurero Zonal / Descarte**</p>
            <p class="text-xs mt-1">${point.description}</p>
        `);
    });
}

// NUEVA FUNCIÓN: Añadir Puntos Híbridos (Icono Naranja)
function addHybridMarkers(mapInstance) {
    hybridPoints.forEach(point => {
        const marker = L.marker(point.coords, { icon: OrangeIcon }).addTo(mapInstance);
        marker.bindPopup(`
            <h4 class="font-bold text-orange-600">🟠 ${point.name}</h4>
            <p class="text-sm">Tipo: **Punto Híbrido (Acopio + Descarte)**</p>
            <p class="text-xs mt-1">${point.description}</p>
        `);
    });
}


// --- LÓGICA DE TABS Y MODAL ---

function showTab(tabId) {
    // 1. Ocultar todas las páginas y remover la clase 'active' de los botones
    tabPages.forEach(page => page.classList.add('hidden'));
    tabButtons.forEach(button => button.classList.remove('active'));

    // 2. Mostrar la página seleccionada y activar el botón de la pestaña principal
    document.getElementById(tabId).classList.remove('hidden');
    
    let activeTabId = tabId;
    if (tabId.startsWith('edu-')) {
        activeTabId = 'education';
    }

    document.querySelector(`.tab-button[data-tab="${activeTabId}"]`).classList.add('active');
    
    // 3. Lógica para inicializar/refrescar el mapa o actualizar incentivos
    if (tabId === 'dashboard') {
        if (!mapInitialized) {
            initMap();
            mapInitialized = true;
        } else {
            if (mymap) {
                setTimeout(() => mymap.invalidateSize(), 100); 
            }
        }
    } else if (tabId === 'incentives') { // <-- LLAMADA PARA CARGAR DATOS DE INCENTIVOS
        updateIncentiveUI(); 
    }
    
    // Re-renderizar iconos
    lucide.createIcons();
}

// Asignar eventos de click a los botones de pestaña
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        showTab(button.dataset.tab);
    });
});

// Funciones para el Modal de Mensajes (Mantenidas)
window.showMessage = function(message) {
    modalText.textContent = message;
    messageModal.classList.remove('hidden');
    modalContent.classList.remove('opacity-0', 'scale-95');
    modalContent.classList.add('opacity-100', 'scale-100');
    messageModal.classList.add('flex');
}

window.closeModal = function() {
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        messageModal.classList.add('hidden');
        messageModal.classList.remove('flex');
    }, 300); 
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    showTab('dashboard');
});