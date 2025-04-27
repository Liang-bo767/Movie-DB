const BASE_URL = "https://api.themoviedb.org/3/movie/";
const API_KEY = "da7000fdd792848adc587bed175fd74f";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
// Model
const state = {
  category: "popular",
  page: 1,
  total_pages: 1,
  movies: [],
  liked_movies: [],
  liked_movies_ids: new Set(),
};

// Controller
function fetchMovies() {
  fetch(`${BASE_URL}${state.category}?api_key=${API_KEY}&page=${state.page}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      console.log(data);
      state.movies = data.results;
      state.total_pages = data.total_pages;
      render();
    });
}

function fetchMovieDetails(id) {
  fetch(`${BASE_URL}${id}?api_key=${API_KEY}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      renderModal(data);
    });
}

// View
const home = document.querySelector("#home");
const likedList = document.querySelector("#liked-list");
const movieContainer = document.querySelector(".movie-container");
const category = document.querySelector("#category");
const pageContainer = document.querySelector(".page");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const page = document.querySelector("#page");
const closeModal = document.querySelector(".modal-close");

function createMovie(movie) {
  const container = document.createElement("div");
  container.className = "movie";
  container.id = movie.id;
  container.innerHTML = `
    <img class="movie-poster" src="${IMAGE_BASE_URL}${
    movie.poster_path
  }" alt="movie poster" />
    <div class="movie-info">
        <button class="movie-title">${movie.original_title}</button>
        <p class="movie-rating">
            <span>
                <i class="ion-ios-star" style="color: rgb(245, 197, 24)"></i>
                ${movie.vote_average}
            </span>
            <button class="like-button">
                <i class="${
                  state.liked_movies_ids.has(movie.id)
                    ? "ion-ios-heart liked"
                    : "ion-ios-heart-outline"
                }"></i>
            </button>
        </p>
    </div>
      `;
  return container;
}

home.addEventListener("click", () => {
  if (home.classList.contains("active")) return;
  state.category = "popular";
  state.page = 1;
  home.classList.add("active");
  likedList.classList.remove("active");
  pageContainer.style.display = "flex";
  fetchMovies();
});

likedList.addEventListener("click", () => {
  if (likedList.classList.contains("active")) return;
  home.classList.remove("active");
  likedList.classList.add("active");
  state.movies = state.liked_movies;
  pageContainer.style.display = "none";
  render();
});

category.addEventListener("change", () => {
  state.category = category.value;
  state.page = 1;
  fetchMovies();
});

previous.addEventListener("click", () => {
  if (state.page > 1) {
    state.page--;
    fetchMovies();
  }
});

next.addEventListener("click", () => {
  if (state.page < state.total_pages) {
    state.page++;
    fetchMovies();
  }
});

closeModal.addEventListener("click", () => {
  const modal = document.querySelector(".modal");
  modal.style.display = "none";
});

function render() {
  movieContainer.innerHTML = "";
  state.movies.forEach((movie) => {
    movieContainer.appendChild(createMovie(movie));
  });

  page.textContent = `${state.page}/${state.total_pages}`;

  if (state.page === 1) {
    previous.disabled = true;
  } else {
    previous.disabled = false;
  }

  if (state.page === state.total_pages) {
    next.disabled = true;
  } else {
    next.disabled = false;
  }

  const movieTitles = document.querySelectorAll(".movie-title");
  movieTitles.forEach((title, index) => {
    title.addEventListener("click", () => {
      const modal = document.querySelector(".modal");
      modal.style.display = "block";
      fetchMovieDetails(state.movies[index].id);
    });
  });

  const likeButtons = document.querySelectorAll(".like-button");
  likeButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const icon = button.querySelector("i");

      if (icon.classList.contains("ion-ios-heart-outline")) {
        icon.classList.replace("ion-ios-heart-outline", "ion-ios-heart");
        icon.classList.add("liked");
        state.liked_movies.push(state.movies[index]);
        state.liked_movies_ids.add(state.movies[index].id);
      } else {
        icon.classList.replace("ion-ios-heart", "ion-ios-heart-outline");
        icon.classList.remove("liked");
        state.liked_movies = state.liked_movies.filter(
          (movie) => movie.id !== state.movies[index].id
        );
        state.liked_movies_ids.delete(state.movies[index].id);
        state.movies = state.liked_movies;
        render();
      }
    });
  });
}

function renderModal(movie) {
  const modalBody = document.querySelector(".modal-body");
  modalBody.innerHTML = `
    <div class="modal-movie-poster">
        <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="movie poster" />
    </div>
    
    <div class="modal-movie-info">
        <h4 class="modal-movie-title">${movie.original_title}</h4>
        <div class="movie-overview">
            <span>Overview</span>
            <p>${movie.overview}</p>
        </div>
        <div class="movie-genres">
            <span>Genres</span>
            ${movie.genres.map((genre) => `<p>${genre.name}</p>`).join("")}
        </div>
        <div class="modal-movie-rating">
            <span>Rating</span>
            <p>${movie.vote_average}</p>
        </div>
        <div class="movie-production">
            <span>Production</span>
            ${movie.production_companies
              .map(
                (company) =>
                  `<div class="company-logo">
                    <img src="${IMAGE_BASE_URL}/${company.logo_path}" />
                </div>`
              )
              .join("")}
        </div>
    </div>
    `;
}

fetchMovies();
