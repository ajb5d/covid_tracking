'use strict';
import * as d3 from "d3";

function drawFigure(dataset) {
  dataset.forEach(d => {
    d['dates'] = d['dates'].map(e => new Date(e));
  });

  const healthDistricts = ['Blue Ridge', 'Virginia Beach', "Central Shenandoah"];
  const plotData = dataset.filter(e => healthDistricts.includes(e.health_district));

  const width = 600;
  const height = 400;
  const margin = {
    left: 30,
    right: 10,
    top: 10,
    bottom: 30,
  };

  const dateLength = dataset[0].weeklyNewCaseAvg.length;

  const x = d3.scaleUtc()
    .domain(d3.extent(plotData.flatMap(e => e.dates.slice(0,dateLength))))
    .range([0, width]);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(plotData.flatMap(e => e.newCases))])
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
    .curve(d3.curveBasis)
    .x(d => x(d[0]))
    .y(d => y(d[1]))

  const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(healthDistricts);

  for (const district of healthDistricts) {
    const hdData = plotData.find(r => r.health_district == district);

    svg.append("path")
      .datum(d3.zip(hdData.dates, hdData.weeklyNewCaseAvg))
      .attr("stroke", colorScale(district))
      .attr("fill", "none")
      .attr("d", line);

    svg.append("g")
      .selectAll("circle")
      .data(d3.zip(hdData.dates, hdData.newCases.slice(0, dateLength)))
      .join("circle")
      .attr('fill', colorScale(district))
      .attr('cx', r => x(r[0]))
      .attr('cy', r => y(r[1]))
      .attr('r', 1);
  }
  healthDistricts.map( (district, index) => {
    svg.append("text")
      .classed('legend-text', true)
      .attr("x", width * 0.8)
      .attr("y", height * 0.2 + 10 * index)
      .attr('fill', colorScale(district))
      .text(district)
  });
}

d3.json("rates_by_hd.json").then((data) => {
  drawFigure(data);
});

function drawHDRateMap(mapData, rateData) {
  const maxVal = d3.max(Object.keys(rateData).filter(d => d != 'Out Of State').map(d => rateData[d])) + 0.01;
  const color = d3.scaleSequential(d3.interpolateViridis)
    .domain([0, maxVal]);

  const svg = d3.select("div#map")
    .append("div")
    .classed("svg-container", true) 
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, 975, 610])
    .classed("svg-content-responsive", true)

  let projection = d3.geoConicConformal()
    .rotate([78.5,-37.66667])
    .parallels([38.03333,39.2])
    .fitSize([975, 610], mapData);

  let geoGenerator = d3.geoPath().projection(projection);
  let colorGenerator = r => {
    return color(rateData[r.properties.vdh_hd] ?? 0);
  };

  svg.append('g')
    .selectAll('path')
    .data(mapData.features)
    .join('path')
    .attr('fill', colorGenerator)
    .attr('stroke', 'black')
    .attr('d', geoGenerator);

  const figureData = d3.range(0, maxVal, maxVal / 10)
    .map((i,v) => ({
      step: i, 
      offset: v,
      color: color(i),
    }));

  const pctFmt = d3.format("0.1%")

  svg.append('g')
    .selectAll('rect')
    .data(figureData)
    .join('rect')
    .attr('fill', d => d.color)
    .attr('width', 31)
    .attr('height', 30)
    .attr('x', d => 30 + 30 * d.offset)
    .attr('y', 30);

  svg.append('g')
    .selectAll('text')
    .data(figureData)
    .join('text')
    .classed('map-legend-text', true)
    .attr('x', d => 45 + 30 * d.offset)
    .attr('y', 27)
    .text(d => pctFmt(d.step));

}

Promise.all([
  d3.json("va_health_districts.geojson"),
  d3.json("pcr_positive_by_hd.json"),
]).then( (data) => {
  drawHDRateMap(data[0], data[1])
});

function drawCountyRates(mapData, rateData) {  
  const color = d3.scaleLinear()
    .domain([0, d3.max(rateData.map( d => d[1]))])
    .range(['white', 'red'])

  const svg = d3.select("div#countyMap")
    .append("div")
    .classed("svg-container", true) 
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, 975, 610])
    .classed("svg-content-responsive", true)

  let projection = d3.geoConicConformal()
    .rotate([78.5,-37.66667])
    .parallels([38.03333,39.2])
    .fitSize([975, 610], mapData);

  let geoGenerator = d3.geoPath().projection(projection);
  let colorGenerator = r => {
    const target = `51${r.properties.COUNTY}`
    const result = rateData.find(x => x[0] == target) ?? [0,0];
    console.log(color(result[1]));
    return color(result[1]);
  };

  svg.append('g')
    .selectAll('path')
    .data(mapData.features)
    .join('path')
    .attr('fill', colorGenerator)
    .attr('stroke', 'black')
    .attr('d', geoGenerator);
}

Promise.all([
  d3.json("va_counties.geojson"),
  d3.json('rates_by_county.json')
]).then( (data) => {
  drawCountyRates(data[0], data[1])
});