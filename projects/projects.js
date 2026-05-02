import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const title = document.querySelector('.projects-title');
title.textContent = `${projects.length} Projects`;

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
let query = '';
let selectedIndex = -1;
let selectedYear = null;
let pieData = [];

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const pieGenerator = d3.pie().value((d) => d.value);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsToRender) {
  const rolledData = d3.rollups(
    projectsToRender,
    (projectGroup) => projectGroup.length,
    (project) => project.year,
  );

  pieData = rolledData.map(([year, count]) => ({
    value: count,
    label: year,
  }));

  if (selectedYear !== null) {
    selectedIndex = pieData.findIndex((slice) => slice.label === selectedYear);

    if (selectedIndex === -1) {
      selectedYear = null;
    }
  }

  d3.select('svg').selectAll('path').remove();

  d3.select('.pie-chart')
    .selectAll('path')
    .data(pieGenerator(pieData))
    .join('path')
    .attr('class', (_d, i) => i === selectedIndex ? 'selected' : null)
    .attr('d', arcGenerator)
    .attr('fill', (_d, i) => colors(i))
    .on('click', (event, d) => {
      const clickedYear = d.data.label;
      const clickedIndex = pieData.findIndex((slice) => slice.label === clickedYear);

      if (selectedIndex === clickedIndex) {
        selectedIndex = -1;
        selectedYear = null;
      } else {
        selectedIndex = clickedIndex;
        selectedYear = clickedYear;
      }

      updateSelectionClasses();
      renderProjects(getVisibleProjects(), projectsContainer, 'h2');
    });

  const legend = d3.select('.legend');
  legend.selectAll('*').remove();

  const legendItems = legend
    .selectAll('li')
    .data(pieData)
    .join('li')
    .attr('class', (_d, i) => `legend-item${i === selectedIndex ? ' selected' : ''}`);

  legendItems.append('span')
    .attr('class', 'legend-swatch')
    .style('background-color', (_d, i) => colors(i));

  legendItems.append('span')
    .text((d) => d.label);

  legendItems.append('em')
    .attr('class', 'legend-value')
    .text((d) => `(${d.value})`);
}

function updateSelectionClasses() {
  d3.select('.pie-chart')
    .selectAll('path')
    .classed('selected', (_d, i) => i === selectedIndex);

  d3.select('.legend')
    .selectAll('li')
    .classed('selected', (_d, i) => i === selectedIndex);
}

function matchesSearch(project) {
  const projectText = Object.values(project).join('\n').toLowerCase();
  return projectText.includes(query);
}

function getSearchFilteredProjects() {
  return query ? projects.filter(matchesSearch) : projects;
}

function getVisibleProjects() {
  let filteredProjects = getSearchFilteredProjects();
  if (selectedIndex !== -1) {
    const selectedYearLabel = pieData[selectedIndex].label;
    filteredProjects = filteredProjects.filter((project) => project.year === selectedYearLabel);
  }

  return filteredProjects;
}

function updateVisibleProjects() {
  const searchFilteredProjects = getSearchFilteredProjects();

  if (selectedYear && !searchFilteredProjects.some((project) => project.year === selectedYear)) {
    selectedIndex = -1;
    selectedYear = null;
  }

  renderPieChart(searchFilteredProjects);
  renderProjects(getVisibleProjects(), projectsContainer, 'h2');
}

updateVisibleProjects();

searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  updateVisibleProjects();
});
