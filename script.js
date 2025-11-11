// Referencias a elementos
const tabButtons = document.querySelectorAll('.tab-button');
const tabPages = document.querySelectorAll('.tab-page');
const messageModal = document.getElementById('message-modal');
const modalContent = messageModal.querySelector('.bg-white');
const modalText = document.getElementById('modal-text');

// Función para cambiar de pestaña
function showTab(tabId) {
    // 1. Ocultar todas las páginas y remover la clase 'active' de los botones
    tabPages.forEach(page => page.classList.add('hidden'));
    tabButtons.forEach(button => button.classList.remove('active'));

    // 2. Mostrar la página seleccionada y activar el botón
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    
    // Re-renderizar iconos en el contenido de la pestaña (necesario para Lucide)
    lucide.createIcons();
}

// Asignar eventos de click a los botones de pestaña
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        showTab(button.dataset.tab);
    });
});

// Funciones para el Modal de Mensajes

// Muestra el modal con un mensaje
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

// Oculta el modal
window.closeModal = function() {
    // Animación de salida
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
        messageModal.classList.add('hidden');
        messageModal.classList.remove('flex');
    }, 300); // Espera que termine la transición CSS
}

// Mostrar el dashboard al cargar y crear los iconos iniciales
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos de Lucide (primera vez)
    lucide.createIcons();
    showTab('dashboard');
});