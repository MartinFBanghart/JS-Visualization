import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function render(renderElement, data) {
  renderElement.innerHTML = "";
  // Get the width of the render element
  let dimensions = renderElement.getBoundingClientRect();
  let width = dimensions.width;
  let height = 400;

  // Create an SVG element within the document
  let svg = d3
    .select(renderElement)
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // ESTABLISH SCALES

  const PADDING = { left: 37, right: 10, top: 30, bottom: 30 };

  const barSpace = (width - PADDING.left - PADDING.right) / data.length;
  const barWidth = barSpace * 0.8;

  const parseYear = d3.timeParse("%Y");

  let xScale = d3
    .scaleOrdinal()
    .domain(data.map((d) => parseYear(d.Year)))
    .range(data.map((d, i) => PADDING.left + barSpace / 2 + i * barSpace));

  // simplifies down to just year from d3.autoType datetime format
  const formatYear = d3.timeFormat("%Y");

  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Value)])
    .range([height - PADDING.bottom, PADDING.top])
    .nice(4);

  // DRAW AXES

  const tickLength = 8;
  const tickGap = 4;

  let xTicks = data.map((d) => parseYear(d.Year));

  let xtickGroups = svg.append("g").selectChildren().data(xTicks).join("g");

  xtickGroups
    .append("line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", height - PADDING.bottom)
    .attr("y2", height - PADDING.bottom + tickLength)
    .classed("tickline", true);

  xtickGroups
    .append("text")
    .attr("x", (d) => xScale(d))
    .attr("y", height - PADDING.bottom + tickLength + tickGap)
    .text((d) => formatYear(d))
    .classed("chart-label", true)
    .classed("xtick", true);

  let yTicks = yScale.ticks(4);

  let isFirstYTick = (tick) => yScale(tick) === d3.min(yTicks, yScale);

  let yTickGroups = svg
    .append("g")
    .selectChildren()
    .data(yTicks)
    .join("g")
    .classed("first-tick", isFirstYTick);

  yTickGroups
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .classed("tickline", true)
    .classed("tickline-zero", (d) => d === 0);

  yTickGroups
    .append("text")
    .attr("x", PADDING.left - 5)
    .attr("y", (d) => yScale(d))
    .text((d) => d)
    .classed("chart-label", true)
    .classed("ytick", true);

  svg
    .select(".first-tick")
    .append("text")
    .text("M")
    .attr("x", PADDING.left)
    .attr("y", (d) => yScale(d))
    .classed("chart-label", true)
    .classed("ytick-unit", true);

  svg
    .select(".first-tick")
    .append("text")
    .text("$")
    .attr("x", 4)
    .attr("y", (d) => yScale(d))
    .classed("chart-label", true)
    .classed("ytick-unit-2", true);

  // DRAW DATA MARKS

  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => xScale(d.Year) - barWidth / 2)
    .attr("y", (d) => yScale(d.Value))
    .attr("width", barWidth)
    .attr("height", (d) => yScale(0) - yScale(d.Value) - 1)
    .style("fill", "green")
    .style("fill", (d, i) => (i === 2 ? "grey" : "green"))
    .classed("covid-year", (d, i) => i === 2);

  // text overlay for covid year (2020, 3rd bar in chart)
  let overlayText = svg
    .append("text")
    .attr("x", xScale(data[2].Year) - 2)
    .attr("y", yScale(data[2].Value) + 70) // Adjust the positioning as needed
    .text("*Covid")
    .attr("text-anchor", "middle") // Align text to the middle of the bar
    .classed("overlay-text", true);
}

// load the data (and wait for it to get here)
let data = await d3.csv("./Data/wood_exports.csv", d3.autoType);

let el = document.querySelector(".viz-1-graph-2");

render(el, data);
// if the browser window changes size, rerender
window.addEventListener("resize", () => render(el, data));
