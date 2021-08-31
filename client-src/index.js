'use strict';
import * as d3 from "d3";

function drawFigure(dataset) {
  const width = 600;
  const height = 400;
  const margin = {
    left: 30,
    right: 10,
    top: 10,
    bottom: 30,
  };

  const x = d3.scaleUtc()
    .domain(d3.extent(dataset.map( s => s.report_date)))
    .range([0, width]);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset.map( s => s.total_cases_daily))])
    .range([height, 0])
    .nice();

  const svg = d3.select("div#figure")
    .append("div")
    .classed("svg-container", true) 
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0,0, width + margin.left + margin.right, height + margin.top + margin.bottom])
    .classed("svg-content-responsive", true)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg.append("g")
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  let line = d3.line()
    .defined(d => !isNaN(d.total_cases_average))
    .x(d => x(d.report_date))
    .y(d => y(d.total_cases_average))

  const healthDistricts = ['Blue Ridge', 'Fairfax', 'Virginia Beach', "Central Shenandoah"];
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(healthDistricts);

  for (const district of healthDistricts) {
    svg.append("path")
      .datum(dataset.filter( r => r.vdh_health_district == district))
      .attr("stroke", colorScale(district))
      .attr("fill", "none")
      .attr("d", line);

    svg.append("g")
      .selectAll("circle")
      .data(dataset.filter( r => r.vdh_health_district == district))
      .join("circle")
      .attr('fill', colorScale(district))
      .attr('cx', r => x(r.report_date))
      .attr('cy', r => y(r.total_cases_daily))
      .attr('r', 1);
  }
  healthDistricts.map( (district, index) => {
    svg.append("text")
      .attr("x", width * 0.8)
      .attr("font-size", "8")
      .attr("y", height * 0.2 + 10 * index)
      .attr('fill', colorScale(district))
      .text(district)
  });
}

d3.json("/output.json").then( (data) => {
  drawFigure(data);
});

