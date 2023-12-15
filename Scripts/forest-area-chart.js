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

  const PADDING = { left: 20, right: 30, top: 30, bottom: 30 };

  const parseYear = d3.timeParse("%Y");

  let xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => parseYear(d.Year)))
    .range([PADDING.left, width - PADDING.right]);

  // simplifies down to just year from d3.autoType datetime format
  const formatYear = d3.timeFormat("%Y");

  let yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.Area / 1e3))
    .range([height - PADDING.bottom, PADDING.top])
    .nice(4);

  // DRAW AXES

  const tickLength = 8;
  const tickGap = 4;

  let xTicks = xScale.ticks(5);

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
    .classed("tickline-zero", (d) => d === 12);

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
    .text("kha")
    .attr("x", PADDING.left)
    .attr("y", (d) => yScale(d))
    .classed("chart-label", true)
    .classed("ytick-unit", true);

  //   // DRAW DATA MARKS

  let lineGen = d3
    .line()
    .x((d) => xScale(parseYear(d.Year)))
    .y((d) => yScale(d.Area / 1e3));

  svg
    .append("path")
    .attr("d", lineGen(data))
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 4);
}

//load the data (and wait for it to get here)
let data = await d3.csv("./Data/forest_area.csv", d3.autoType);
//Find the element we want to render into
let el = document.querySelector(".viz-1-graph-1");
//render the chart
render(el, data);
//if the browser window changes size, rerender
window.addEventListener("resize", () => render(el, data));
