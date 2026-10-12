/*MARIA JOSE ROJAS GUTIERREZ*/
const API_KEY = 'TU_API_KEY_AQUI'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('search');
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');


/* NO MODIFICAR */
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};


/* NO MODIFICAR */
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();


/* CODIGO */

const obtenerPeliculas = async () => {
    const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    return datos.results;
};

const crearTarjeta = (pelicula) => {
    const { name, title, first_air_date, release_date, vote_average, poster_path } = pelicula;
    const fecha = first_air_date || release_date;
    const año = fecha ? fecha.split('-')[0] : 'N/A';
    const rating = vote_average ? vote_average.toFixed(1) : 'N/A';

    return `
        <article class="movie-card">
            <div class="movie-card__poster">
                <img class="movie-card__image" src="${imagen}" alt="${nombre}">
            </div>
            <div class="movie-card__content">
                <h3 class="movie-card__title">${nombre}</h3>
                <p class="movie-card__year">${año}</p>
                <p class="movie-card__rating">⭐ ${rating}</p>
            </div>
        </article>
    `;
};

const iniciar = async () => {
    console.log('Mostrando series populares...');
    mostrarLoading();
    try {
        const peliculas = await obtenerPeliculas();
        console.log(`${peliculas.length} series obtenidas`);
        ocultarLoading();
        seriesGrid.innerHTML = peliculas.map(crearTarjeta).join('');
        console.log('Series renderizadas');
    } catch (error) {
        console.log('Error:', error);
        let mensaje = 'No se pudieron cargar los datos';
        if (error.message.includes('401')) {
            mensaje = 'API Key Inválida';
             } else if (error.message.includes(fetch)){
            mensaje = 'Error de conexion';
        mostrarError(mensaje);
        }else if (error.message.includes('429')){
            mensaje ='Existen muchas peticiones amigo';
        }
        mostrarError(mensaje);
    }
};

iniciar();

const buscarPeliculas = async (texto) => {
    if (!texto || texto.trim() === '') {
        return obtenerPeliculas();
    }

    const query = encodeURIComponent(texto.trim());
    const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${query}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    return datos.results;
};

let timeoutBusqueda = null;
searchInput.addEventListener('input', (evento) => {
    const texto = evento.target.value;
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(async () => {
        console.log(`Buscando: ${texto}`);
        mostrarLoading();
        try {
            const peliculas = await buscarPeliculas(texto);
            ocultarLoading();
            if (peliculas.length === 0) {
                seriesGrid.innerHTML = `<p>No se encontraron resultados para: "${texto}"</p>`;
                return;
            }
            seriesGrid.innerHTML = peliculas.map(crearTarjeta).join('');
            console.log(`${peliculas.length} resultados obtenidos`);
        } catch (error) {
            console.log('Error en búsqueda:', error);
            mostrarError('Error al realizar la búsqueda.');
        }
    }, 500);
});