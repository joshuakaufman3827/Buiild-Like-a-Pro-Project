const API_KEY = "96a1cd9e"; 
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const ratingFilter = document.getElementById("ratingFilter");
const results = document.getElementById("results");
const loading = document.getElementById("loading");
const resultsCount = document.getElementById("resultsCount");

let movies = [];

// Fetch movies + detailed info
async function fetchMovies(query) {
  loading.classList.remove("hidden");
  results.innerHTML = "";
  resultsCount.innerHTML = "";

  try {
    // Page 1
    const url1 = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=1`;
    const res1 = await fetch(url1);
    const data1 = await res1.json();

    // Page 2
    const url2 = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=2`;
    const res2 = await fetch(url2);
    const data2 = await res2.json();

    loading.classList.add("hidden");

    const combined = [...(data1.Search || []), ...(data2.Search || [])];

    // Limit to 12 movies
    const limited = combined.slice(0, 12);

    if (limited.length === 0) {
      results.innerHTML = "<p>No results found.</p>";
      resultsCount.innerHTML = "0 movies found";
      movies = [];
      return;
    }

    // Fetch detailed info for each movie
    const detailedMovies = await Promise.all(
      limited.map(async movie => {
        const detailRes = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`
        );
        const details = await detailRes.json();

        return {
          ...movie,
          ...details,
          Price: (Math.random() * 5 + 1).toFixed(2)
        };
      })
    );

    movies = detailedMovies;
    sortMovies(); // apply filters + sorting

  } catch (error) {
    loading.classList.add("hidden");
    results.innerHTML = "<p>Error fetching movies.</p>";
    console.error(error);
  }
}

// Filter by rating
function filterByRating(list) {
  const value = ratingFilter.value;

  if (value === "all") return list;

  return list.filter(movie => {
    const rating = parseFloat(movie.imdbRating);
    return rating >= parseFloat(value);
  });
}

// Render movie cards
function renderMovies(list) {
  results.innerHTML = "";

  let count = 0;

  list.forEach(movie => {
    if (movie.Poster === "N/A") return;

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${movie.Poster}" 
           onerror="this.parentElement.style.display='none'">

      <div class="card-content">
        <h3>${movie.Title}</h3>

        <div class="spec-row">
          <span><strong>Genre:</strong> ${movie.Genre}</span>
          <span><strong>Runtime:</strong> ${movie.Runtime}</span>
          <span><strong>Rated:</strong> ${movie.Rated}</span>
        </div>

        <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>

        <div class="price-tag">
          Movie Rental: <span class="price">$${movie.Price}</span>
        </div>
      </div>
    `;

    results.appendChild(card);
    count++;
  });

  resultsCount.innerHTML = `${count} movies found`;
}

// Sorting logic
function sortMovies() {
  let sorted = [...movies];
  const value = sortSelect.value;

  if (value === "az") {
    sorted.sort((a, b) => a.Title.localeCompare(b.Title));
  } 
  else if (value === "za") {
    sorted.sort((a, b) => b.Title.localeCompare(a.Title));
  } 
  else if (value === "newest") {
    sorted.sort((a, b) => b.Year - a.Year);
  } 
  else if (value === "oldest") {
    sorted.sort((a, b) => a.Year - b.Year);
  }
  else if (value === "expensive") {
    sorted.sort((a, b) => parseFloat(b.Price) - parseFloat(a.Price));
  }
  else if (value === "cheap") {
    sorted.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
  }

  // Apply rating filter
  const filtered = filterByRating(sorted);

  renderMovies(filtered);
}

// Search input listener
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    fetchMovies(query);
  } else {
    results.innerHTML = "";
    resultsCount.innerHTML = "";
    movies = [];
  }
});

// Sort dropdown listener
sortSelect.addEventListener("change", sortMovies);

// Rating filter listener
ratingFilter.addEventListener("change", sortMovies);

// Initial load
window.addEventListener("load", () => {
  fetchMovies("Action");
});

// CONTACT MODAL
const contactModal = document.getElementById("contactModal");
const contactLink = document.getElementById("contactLink");
const closeBtn = contactModal.querySelector(".close");

contactLink.addEventListener("click", (e) => {
  e.preventDefault();
  contactModal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  contactModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === contactModal) {
    contactModal.style.display = "none";
  }
});



