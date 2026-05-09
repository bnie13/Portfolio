console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Detect base path (local vs GitHub Pages)
const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/Portfolio/";

// Add theme switcher
document.body.insertAdjacentHTML(
  "afterbegin",
  `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `
);

// Pages config
let pages = [
  { url: "", title: "Home" },
  { url: "./projects/", title: "Projects" },
  { url: "./contact/", title: "Contact" },
  { url: "https://github.com/bnie13", title: "Github" },
  { url: "./resume/", title: "Resume" },
  { url: "./meta/", title: "Meta" },
];

// Create nav
let nav = document.createElement("nav");
document.body.prepend(nav);

// Build links
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a);
}

// Theme switching
const select = document.querySelector(".color-scheme select");

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty("color-scheme", colorScheme);
  select.value = colorScheme;
}

if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener("input", function (event) {
  const value = event.target.value;
  setColorScheme(value);
  localStorage.colorScheme = value;
});

const form = document.querySelector("form");

form?.addEventListener("submit", function (event) {
  event.preventDefault();

  const data = new FormData(form);
  let url = form.action + "?";

  for (let [name, value] of data) {
    url += `${name}=${encodeURIComponent(value)}&`;
  }

  location.href = url;
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json(); 
    return data;                         

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  const imagePathPrefix = location.pathname.includes('/projects/') ? '../image/' : 'image/';

  projects.forEach(project => {
    const article = document.createElement('article');
    const imageFileName = project.image.split('/').pop();

    article.innerHTML = `
  <${headingLevel}>${project.title}</${headingLevel}>
  <img src="${imagePathPrefix}${imageFileName}" alt="${project.title}">
  <div>
    <p>${project.description}</p>
    <p class="project-year">c. ${project.year}</p>
  </div>
` ;

    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
