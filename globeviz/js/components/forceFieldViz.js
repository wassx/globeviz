/**
 * Created by stefan.wasserbauer on 14/04/2017.
 */
AFRAME.registerComponent('forcefieldviz', {
	schema: {},
	init: function () {

		let scene = document.querySelector('#forcefield');

		loadDataset(function (obj) {
			processData(obj);
		});

		function processData(data) {
			const that = this;

			const d3Nodes = [];
			for (let nodeId in data.nodes) { // Turn nodes into array
				const node = data.nodes[nodeId];
				node._id = nodeId;
				d3Nodes.push(node);
			}
			const d3Links = data.links.map(link => {
				return {source: link[0], target: link[1]};
			});
			if (!d3Nodes.length) {
				return;
			}

			const nodeRelSize = 0.5;

			d3Nodes.forEach(node => {

				let randColor = Math.round(Math.random());

				let color = (randColor === 1) ? '#ff0000' : '#00ff00';

				const material = new THREE.MeshBasicMaterial({color: color});//material instantiated
				const sphere = new THREE.Mesh(
					new THREE.SphereGeometry(1, 8, 8),
					material
				);
				sphere.name = node.path || '';
				sphere.isSphereNode = true;

				node._sphere = sphere;
				scene.object3D.add(sphere);
			});

			const lineMaterial = new THREE.MeshBasicMaterial({color: '#555555', transparent: false});
			lineMaterial.opacity = 0.75;
			d3Links.forEach(link => {
				const line = new THREE.Line(new THREE.Geometry(), lineMaterial);
				line.geometry.vertices = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];

				const fromName = getNodeName(link.source),
					toName = getNodeName(link.target);
				if (fromName && toName) {
					line.name = `${fromName} > ${toName}`;
				}

				link._line = line;
				scene.object3D.add(line);

				function getNodeName(nodeId) {
					return data.nodes[nodeId].path;
				}
			});

			// // Add force-directed layout
			const layout = d3_force.forceSimulation()
				.numDimensions(3)
				.nodes(d3Nodes)
				.force('link', d3_force.forceLink().id(d => d._id).links(d3Links))
				.force("collide",d3.forceCollide( function(d){return d.r + 8 }).iterations(16) )
				.force('charge', d3_force.forceManyBody())
				.force("center", d3.forceCenter(0, 1))
				.force("y", d3.forceY(0))
				.force("x", d3.forceX(0))
				.stop();
			//
			for (let i = 0; i < 0; i++) {
				layout.tick();
			} // Initial ticks before starting to render

			let cntTicks = 0;
			const startTickTime = new Date();
			layout.on("tick", layoutTick).restart();

			function layoutTick() {
				if (cntTicks++ > 300 || (new Date()) - startTickTime > 15000) {
					layout.stop(); // Stop ticking graph
				}
				// Update nodes position
				d3Nodes.forEach(node => {
					// console.log(node);
					const sphere = node._sphere;
					sphere.position.x = node.x;
					sphere.position.y = node.y || 0;
					sphere.position.z = node.z || 0;
				});

				// Update links position
				d3Links.forEach(link => {
					const line = link._line;

					line.geometry.vertices = [
						new THREE.Vector3(link.source.x, link.source.y || 0, link.source.z || 0),
						new THREE.Vector3(link.target.x, link.target.y || 0, link.target.z || 0)
					];

					line.geometry.verticesNeedUpdate = true;
					line.geometry.computeBoundingSphere();
				});
			}
		}


	},
	update: function () {
	},
	tick: function () {

		// console.log(this.el.sceneEl.children);

		// let intersects = this.raycaster.intersectObjects(this.el.sceneEl.children);
		// if (intersects.length > 0) {
		// 	console.log(intersects);
		// }


	},
	remove: function () {
	},
	pause: function () {
	},
	play: function () {
	}

});

AFRAME.registerComponent('cursor-listener', {
	init: function () {
		var COLORS = ['red', 'green', 'blue'];
		this.el.addEventListener('click', function (evt) {
			var randomIndex = Math.floor(Math.random() * COLORS.length);
			this.setAttribute('material', 'color', COLORS[randomIndex]);
			console.log('I was clicked at: ', evt.detail.intersection.point);
		});
	}
});

AFRAME.registerComponent('collider-check', {
	dependencies: ['raycaster'],
	init: function () {
		this.el.addEventListener('raycaster-intersected', function (evt) {
			console.log('Player hit something!');
			console.log(evt);
		});
	}
});


