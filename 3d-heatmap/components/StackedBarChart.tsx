import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface StackedBarChartProps {
  data: { date: string; battles: number; explosions: number }[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      console.log('No data available to draw chart');
      return; // Return early if there's no data
    }

    console.log('Data for chart:', data); // Debug log to check data being passed

    drawChart(data);
  }, [data]);

  const drawChart = (data) => {
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove(); // Clear previous chart before re-rendering

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Append a group element to the SVG to respect the margins
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (for dates)
    const x = d3.scaleBand()
      .domain(data.map((d) => d.date))  // Date for each column
      .range([0, width])
      .padding(0.2);

    // Y scale (for battles + explosions)
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.battles + d.explosions)])  // Max value for stacking
      .nice() // Ensure the domain ends nicely at round values
      .range([height, 0]);

    // Color scale for stacks
    const color = d3.scaleOrdinal()
      .domain(['battles', 'explosions'])
      .range(['#1f77b4', '#ff7f0e']);  // Color for each stack

    // Stack the data
    const stack = d3.stack()
      .keys(['battles', 'explosions']);  // Keys for stacking

    const stackedData = stack(data);

    // Append the group for each bar
    const barGroups = g.selectAll('g')
      .data(stackedData)
      .enter().append('g')
      .attr('fill', (d) => color(d.key));

    // Append the rectangles (stacks) for each bar
    barGroups.selectAll('rect')
      .data((d) => d)
      .enter().append('rect')
      .attr('x', (d) => x(d.data.date))
      .attr('y', (d) => y(d[1]))
      .attr('height', (d) => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth());

    // Add X-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y-axis
    g.append('g')
      .call(d3.axisLeft(y));
  };

  return (
    <svg ref={chartRef} width={500} height={300}>
      {/* D3 chart will be drawn here */}
    </svg>
  );
};

export default StackedBarChart;
