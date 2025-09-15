import * as React from "react";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import worldData from "../../lib/world.json";

const GlobeComponent = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const visitedCountries = [
    "France",
    "China",
    "Italy",
    "Germany",
    "Belgium",
    "Switzerland",
    "Denmark",
    "Norway",
    "Poland",
    "Fenland",
    "Netherlands"
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    // Clear any existing content
    d3.select(mapContainer.current).selectAll("*").remove();

    const width = mapContainer.current.clientWidth;
    const height = mapContainer.current.clientHeight || 250;
    const sensitivity = 75;
    const scale = Math.min(width, height) * 0.5; // Make globe 50% of container size

    let projection = d3
      .geoOrthographic()
      .scale(scale)
      .center([0, 0])
      .rotate([0, -40])
      .translate([width / 2, height / 2]);

    let pathGenerator = d3.geoPath().projection(projection);

    let svg = d3
      .select(mapContainer.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg
      .append("circle")
      .attr("fill", "#EEE")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", scale);

    let map = svg.append("g");

    map
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", (d: any) => pathGenerator(d as any))
      .attr("fill", (d: { properties: { name: string } }) =>
        visitedCountries.includes(d.properties.name) ? "#E63946" : "white"
      )
      .style("stroke", "black")
      .style("stroke-width", 0.3)
      .style("opacity", 0.8);

    const timer = d3.timer(() => {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([rotate[0] - 0.5 * k, rotate[1]]);
      svg.selectAll("path").attr("d", (d: any) => pathGenerator(d as any));
    }, 50);

    // Cleanup function
    return () => {
      timer.stop();
      d3.select(mapContainer.current).selectAll("*").remove();
    };
  }, []);

  return (
    <div className="flex flex-col text-white justify-center items-center w-full h-full">
      <div ref={mapContainer} className="w-full h-full max-w-[200px] max-h-[200px]"></div>
    </div>
  );
};

export default GlobeComponent;
