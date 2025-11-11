// Referencias a elementos
const tabButtons = document.querySelectorAll('.tab-button');
const tabPages = document.querySelectorAll('.tab-page');
const messageModal = document.getElementById('message-modal');
const modalContent = messageModal.querySelector('.bg-white');
const modalText = document.getElementById('modal-text');

// Variables para el Mapa Leaflet
const COCHABAMBA_COORDS = [-17.3932, -66.1568]; 
const DEFAULT_ZOOM = 13;
let mapInitialized = false; // Bandera para asegurar que el mapa se inicialice solo una vez

// Función para inicializar el mapa
function initMap() {
    // 1. Inicializa el mapa y lo asigna al div 'mapid'
    const mymap = L.map('mapid').setView(COCHABAMBA_COORDS, DEFAULT_ZOOM);

    // 2. Carga los "tiles" (imágenes del mapa) de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mymap);

    // 3. Añade un marcador de ejemplo (simulando un Punto de Recolección)
    const marker = L.marker([-17.385, -66.155]).addTo(mymap); // Lat/Lng cercano al centro de Cocha
    marker.bindPopup("<b>Punto de Recolección Central</b><br>Orgánicos y Reciclables.").openPopup();
}


// Función para cambiar de pestaña (Actualizada para manejar el mapa)
function showTab(tabId) {
    // 1. Ocultar todas las páginas y remover la clase 'active' de los botones
    tabPages.forEach(page => page.classList.add('hidden'));
    tabButtons.forEach(button => button.classList.remove('active'));

    // 2. Mostrar la página seleccionada y activar el botón
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    
    // 3. Lógica para inicializar el mapa solo una vez al mostrar el Dashboard
    if (tabId === 'dashboard' && !mapInitialized) {
        initMap();
        mapInitialized = true;
    }
    
    // Re-renderizar iconos en el contenido de la pestaña
    lucide.createIcons();
}

// Asignar eventos de click a los botones de pestaña
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        showTab(button.dataset.tab);
    });
});

// Funciones para el Modal de Mensajes (expuestas globalmente)
window.showMessage = function(message) {
    modalText.textContent = message;
    messageModal.classList.remove('hidden');
    messageModal.classList.add('flex');
    // Animación de entrada
    setTimeout(() => {
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
    }, 10);
}

window.closeModal = function() {
    // Animación de salida
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        messageModal.classList.add('hidden');
        messageModal.classList.remove('flex');
    }, 300); // Espera que termine la transición CSS
}

// Inicialización: Mostrar el dashboard al cargar y crear los iconos iniciales
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos de Lucide y luego el Dashboard (que llamará a initMap)
    lucide.createIcons();
    showTab('dashboard');
});