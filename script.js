const generoSlides = document.querySelectorAll('.generos-carrusel .genero-slide');
const prevBtn = document.querySelector('.genero-prev');
const nextBtn = document.querySelector('.genero-next');
let currentGenero = 0; // índice del slide actual

// Función que muestra el slide según su índice
function showGenero(index) {
    generoSlides.forEach(slide => slide.classList.remove('active'));
    generoSlides[index].classList.add('active');
}

// Al hacer clic en el botón "prev" retrocede un slide
prevBtn.addEventListener('click', () => {
    currentGenero = (currentGenero - 1 + generoSlides.length) % generoSlides.length;
    showGenero(currentGenero);
});

// Al hacer clic en el botón "next" avanza un slide
nextBtn.addEventListener('click', () => {
    currentGenero = (currentGenero + 1) % generoSlides.length;
    showGenero(currentGenero);
});

// ---------------------------
// Carrusel automático del héroe principal
// ---------------------------

const slides = document.querySelectorAll('.hero-slider .slide');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}, 7000);