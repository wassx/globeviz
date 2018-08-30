/**
 * Created by stefan.wasserbauer on 14/04/2017.
 */

function loadDataset(callback) {

	const colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

	d3.csv("js/data/datanew.csv", function(data) {
		const nodes = {}, links = [], modules = new Set();

		data.forEach(function(obj) {
			const levels = obj.path.split('/'),
				module = levels.length > 1 ? levels[1] : null,
				leaf = levels.pop(),
				parent = levels.join('/');

			modules.add(module);

			nodes[obj.path] = {
				leaf: leaf,
				module: module,
				path: obj.path,
				size: +obj.size || 1
			};

			if (parent) {
				links.push([parent, obj.path]);
			}
		});

		const moduleColors = {};
		Array.from(modules).forEach((module, idx) => {
			moduleColors[module] = colors[idx%colors.length]; // Rotate colors
		});
		callback({ nodes: nodes, links: links });
	});
}