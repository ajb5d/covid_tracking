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

  const healthDistricts = ['Blue Ridge', 'Fairfax', 'Virginia Beach', "Central Shenandoah"];

  const x = d3.scaleUtc()
    .domain(d3.extent(dataset.map( s => s.report_date)))
    .range([0, width]);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset.filter(s => healthDistricts.includes(s.vdh_health_district)).map(s => s.total_cases_daily))])
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
    .curve(d3.curveBasis)
    .x(d => x(d.report_date))
    .y(d => y(d.total_cases_average))

  
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
  console.log(`${data.length} records`);
  window.dataSet = data;
  drawFigure(data);
});

function drawMap(mapData, rateData) {
  const rateMap = rateData.reduce((dict, element) => (dict[element.vdh_hd] = element.pcr_rate, dict), new Map());

  const color = d3.scaleLinear()
    .domain([0, 0.25])
    .range(['white', 'red'])

  const svg = d3.select("div#map")
    .append("div")
    .classed("svg-container", true) 
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, 975, 610])
    .classed("svg-content-responsive", true)

  const b = [[-0.090317,-0.038369],[0.054986,0.024383]],
    width = 975,
    height = 610,
    s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  let projection = d3.geoConicConformal()
    .rotate([78.5,-37.66667])
    .parallels([38.03333,39.2])
    .fitSize([975, 610], mapData);

  let geoGenerator = d3.geoPath().projection(projection);
  let colorGenerator = r => {
    return color(rateMap[r.properties.vdh_hd]);
  };

  svg.append('g')
    .selectAll('path')
    .data(mapData.features)
    .join('path')
    .attr('fill', colorGenerator)
    .attr('stroke', colorGenerator)
    .attr('d', geoGenerator);

}




Promise.all([
  d3.json("/va_vdh.json"),
  d3.json("/pcr_positive_by_hd.json"),
]).then( (data) => {
  drawMap(data[0], data[1])
});
