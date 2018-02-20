import * as d3 from 'd3'
import { setTooltip, clearTooltip, setAboutContent, clearAboutContent } from '../events'
import { requestSheet } from '../request'
import { uniq, uniqBy } from 'lodash'

let svg, width, height, color, link, node, sim, tooltip, graph, filter

requestSheet((data, tabletop) => {
	const table = tabletop.sheets('organizaciones').all().filter(row => row.priorizada.length)
	const causes = tabletop.sheets('causas').all().filter(cause => cause.visible == '1')

	let nodes = causes.map(cause => ({ id: cause.id, name: cause.label, description: cause.descripcion, r: 15, group: 'cause' }))

	const links = table.reduce((arr, row) => {
		causes.forEach(cause => {
			if (row.causa.includes(cause.label)) {
				nodes.push({ name: row.nombre_organizacion, group: 'organization', r: 12, id: row.uid_org, description: row.descripcion })
				arr.push({ source: cause.label, target: row.nombre_organizacion})
			}
		})
		return arr
	}, [])

	nodes = uniqBy(nodes, o => o.id)
	graph = { nodes, links }
})

function initializeNetwork (selector) {
	svg = d3.select(selector)
	width = +svg.node().getBoundingClientRect().width
	height = +svg.node().getBoundingClientRect().height

	color = d3.scaleOrdinal().domain(['cause', 'organization']).range(['#ed1837', '#000000'])

	tooltip = d3.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('position', 'absolute')

	link = svg.append('g').selectAll('.link')
	node = svg.append('g').selectAll('.node')

	sim = d3.forceSimulation()
		.force('charge', d3.forceManyBody().strength(node => node.r * -80))
		.force('center', d3.forceCenter(width/2, height/2))
		.force('x', d3.forceX(width/2))
		.force('y', d3.forceY(height/2))
		.force('link', d3.forceLink().id(node => node.name).distance(50))

	window.addEventListener('resize', function () {
		width = +svg.node().getBoundingClientRect().width
		height = +svg.node().getBoundingClientRect().height
		sim.force('center').x(width/2).y(height/2)
		sim.force('x').x(width/2)
		sim.force('y').y(height/2)
		sim.alpha(1).restart()
	})

	svg.node().addEventListener('click', () => {
		clearAboutContent()
		update(filter)
		sim.force('x').x(width/2)
		sim.force('y').y(height/2)
		sim.force('link').distance(50)
		//sim.alphaTarget(1).restart()
	})
}
function dragstarted (d) {
	if (!d3.event.active) sim.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged (d) {
	clearTooltip(d, tooltip)
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended (d) {
	if (!d3.event.active) sim.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

function update (group) {

	filter = group
	let linkSet = graph.links
	let nodeSet = graph.nodes
	
	if (group && group != '0') {
		const initialFilteredNodes = nodeSet.filter(node => node.name == group)
		const filteredNodesKeys = initialFilteredNodes.map(node => node.name)

		const initialFilteredLinks = filteredNodesKeys.map(node => {
			return linkSet.filter(link => link.source.name == node)
		})
		const filteredLinks = initialFilteredLinks.reduce((arr, link) => {
			link.forEach(o => arr.push(o))
			return arr
		}, [])

		const initialFilteredNodesChildren = filteredLinks.map(link => link.target.name)
		let childrenFilteredNodes = initialFilteredNodesChildren.map(children => {
			return nodeSet.filter(node => node.name == children)
		})

		childrenFilteredNodes = childrenFilteredNodes.reduce((arr, node) => {
			node.forEach(o => arr.push(o))
			return arr
		}, [])

		const filteredNodes = [...initialFilteredNodes, ...childrenFilteredNodes]

		nodeSet = filteredNodes
		linkSet = filteredLinks
	}

	link = link.data(linkSet)
	link.exit().remove()
	link = link.enter().append('line').attr('class', 'link').merge(link)

	node = node.data(nodeSet)
	node.exit().remove()
	node = node
		.enter()
		.append('circle')
		.attr("class", "node")
		.call(d3.drag()
			.clickDistance(0)
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended)
		)
		.merge(node)
			.attr('fill', d => color(d.group))
			.attr('r', d => d.r)
			.attr('class', d => d.group)
			.on('mouseover', node => setTooltip(node, tooltip, d3))
			.on('mouseleave', node => clearTooltip(node, tooltip))
			.on('click', handleClick)

	sim.force('x').x(width/2)
	sim.force('y').y(height/2)
	sim.nodes(nodeSet).on('tick', ticked)
	sim.force('link').links(linkSet)
	sim.alphaTarget(0.3).restart()
}

function ticked () {
	link
		.attr('x1', node => node.source.x)
		.attr('y1', node => node.source.y)
		.attr('x2', node => node.target.x)
		.attr('y2', node => node.target.y)

	node
		.attr('cx', node => node.x)
		.attr('cy', node => node.y)
}

function handleClick (d) {
	d3.event.stopPropagation()
	sim.alphaTarget(1).restart()
	clearTooltip(d, tooltip)
	setAboutContent(d, d.group)
	update(filter)
	const target = d3.event.target
	const r = target.getAttribute('r')
	const grow = +r * 5
	d3.select(this).transition().ease(d3.easeBackOut).duration(250).attr('r', grow)
	sim.force('link').distance(200)
	d.r = +r
	//sim.alpha(1).restart()
}

module.exports = { initializeNetwork, update }