const API_URL = "/api";
let debounceTimer;

document.addEventListener("DOMContentLoaded", () => {
  checkAuthState();
  setupSearch();
});

function showAuthView(viewId) {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("registerView").classList.add("hidden");
  document.getElementById(viewId).classList.remove("hidden");
}

function navigateTo(pageId, event) {
  if (event) event.preventDefault();

  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.add("hidden");
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  document.getElementById(pageId).classList.remove("hidden");

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  if (pageId === "booksPage") fetchBooks();
  if (pageId === "addBookPage" || pageId === "authorsPage") fetchAuthors();
}

function checkAuthState() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    document.getElementById("authContainer").classList.add("hidden");
    document.getElementById("appLayout").classList.remove("hidden");
    
    document.getElementById("userName").innerText = user.name;
    document.getElementById("userRole").innerText = user.role.toUpperCase();
    document.getElementById("userAvatar").innerText = user.name.charAt(0).toUpperCase();

    fetchBooks();
  } else {
    document.getElementById("authContainer").classList.remove("hidden");
    document.getElementById("appLayout").classList.add("hidden");
    showAuthView("loginView");
  }
}

function logout() {
  localStorage.clear();
  checkAuthState();
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      checkAuthState();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Server connection failed");
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();

    if (data.success) {
      alert("Registration successful! Please login.");
      document.getElementById("registerForm").reset();
      showAuthView("loginView");
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Server connection failed");
  }
});

async function fetchAuthors() {
  try {
    const res = await fetch(`${API_URL}/authors`);
    const data = await res.json();
    if (data.success) {
      const select = document.getElementById("authorSelect");
      const list = document.getElementById("authorsList");
      
      select.innerHTML = `<option value="">Choose an author...</option>`;
      list.innerHTML = "";

      data.data.forEach(author => {
        select.innerHTML += `<option value="${author._id}">${author.name}</option>`;
        list.innerHTML += `
          <li class="author-item">
            <div>
              <div class="author-name">${author.name}</div>
              <div class="author-email">${author.email}</div>
            </div>
          </li>
        `;
      });
    }
  } catch (err) {
    console.error("Failed to load authors");
  }
}

document.getElementById("authorForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("authorName").value;
  const email = document.getElementById("authorEmail").value;

  try {
    const res = await fetch(`${API_URL}/authors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    const data = await res.json();

    if (data.success) {
      alert("Author added!");
      document.getElementById("authorForm").reset();
      fetchAuthors();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Action failed");
  }
});

document.getElementById("bookForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const title = document.getElementById("bookTitle").value;
  const price = document.getElementById("bookPrice").value;
  const author = document.getElementById("authorSelect").value;

  try {
    const res = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, price, author })
    });
    const data = await res.json();

    if (data.success) {
      alert("Book added!");
      document.getElementById("bookForm").reset();
      navigateTo("booksPage");
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Action failed");
  }
});

async function fetchBooks(searchQuery = "") {
  try {
    const url = searchQuery ? `${API_URL}/books?search=${searchQuery}` : `${API_URL}/books`;
    const res = await fetch(url);
    const data = await res.json();
    const grid = document.getElementById("booksGrid");
    grid.innerHTML = "";

    if (data.success && data.data.length > 0) {
      data.data.forEach(book => {
        const authorName = book.author ? book.author.name : "Unknown";
        grid.innerHTML += `
          <div class="book-card">
            <div>
              <div class="book-card-header">
                <span class="book-title">${book.title}</span>
                <span class="book-price">$${book.price}</span>
              </div>
              <div class="book-author"><i class="fa-regular fa-user"></i> ${authorName}</div>
            </div>
            <button class="btn-delete" onclick="deleteBook('${book._id}')">
              <i class="fa-regular fa-trash-can"></i> Delete
            </button>
          </div>
        `;
      });
    } else {
      grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-muted);'>No books found.</p>";
    }
  } catch (err) {
    console.error("Failed to load books");
  }
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchBooks(e.target.value);
    }, 500);
  });
}

async function deleteBook(id) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();

    alert(data.message);
    if (data.success) fetchBooks();
  } catch (err) {
    alert("Delete failed");
  }
}