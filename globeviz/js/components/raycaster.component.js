AFRAME.registerComponent('custom-raycaster', {

	init: function () {
		this.raycaster = new THREE.Raycaster();
		this.hudDetailNode = new hudDetailNode.HUDDetailNode();
		this.origin = null;
		this.direction = null;
		this.test = "test";

		this.mouse = new THREE.Vector2();
		this.scene = this.el.sceneEl.object3D;
		this.camera = document.getElementById('player').object3D.children.filter(c => c.el.id === 'player')[0];

		const that = this;

		this.lastHostname = "";
		this.cursorTimer = null;
		this.updateHudTimer = null;
		this.isCurserSelection = false;

		NAF.connection.subscribeToDataChannel(USER_SELECTION, function (senderRtcId, msgType, data, targetRtcId) {
			console.log(new Date() + " Data received");
			let dataDecode = data;
			that.direction = dataDecode.ray.direction;
			that.origin = dataDecode.ray.origin;
			console.log(dataDecode.host);
		});

	},

	update: function () {

	},

	tick: function () {

		const that = this;

		function updateHudForNode(hostName, processName, isClickable) {

			function updateTimed() {

				if (hostName || processName) {

					// that.hudDetailNode.expand();
				} else {
					// that.hudDetailNode.collapse();
				}

				const hostLabel = 'Host';
				const processLabel = 'Process';
				const hud = document.getElementById('hud-bottom-left').object3D.el;
				const hudPlane = document.getElementById('hud-bottom-left-plane').object3D.el;

				if (!hostName && !processName) {
					hudPlane.setAttribute('visible', 'false');

				} else {
					hudPlane.setAttribute('visible', 'true');
					console.log(that.test);
				}

				const hudContent = `value: 
				${hostLabel}: ${hostName}
				${processLabel}: ${processName}
				;color: white; width: 3; height: auto`;

				hud.setAttribute('text', hudContent);

				if (onChange) {
					if (that.cursorTimer !== null) {
						window.clearTimeout(this.cursorTimer);
						that.cursorTimer = null;
					}

					if (hostName && isClickable) {
						that.isCurserSelection = true;
						that.cursorTimer = window.setTimeout(function () {
							document.getElementById('cursor').dispatchEvent(new Event('cursor-fusing'));
							that.hudDetailNode.expand();
						}, 500);
					} else {
						document.getElementById('cursor').dispatchEvent(new Event('cursor-defuse'));
						that.isCurserSelection = false;
						that.hudDetailNode.collapse();
					}
					const userSelectionData = {
						host: hostName,
						process: processName,
						ray: {
							origin: that.camera.getWorldPosition(),
							direction: that.camera.getWorldDirection()
						}
					};
					NAF.connection.broadcastDataGuaranteed(USER_SELECTION, userSelectionData);
				}
			}

			const onChange = (hostName !== this.lastHostname);
			this.lastHostname = hostName;

			if (onChange) {
				if (this.updateHudTimer !== null) {
					window.clearTimeout(this.updateHudTimer);
					this.updateHudTimer = null;
				}

				const that = this;
				this.updateHudTimer = window.setTimeout(updateTimed, 250);
			}

		}

		function render() {
			that.raycaster.setFromCamera(that.mouse, that.camera);
			const intersects = that.raycaster.intersectObjects(that.scene.children, true);
			intersects.length === 0 && document.getElementById('focusNodeName').object3D.el.removeAttribute('text');

			if (intersects && intersects.length > 0) {
				const currObject = intersects[0].object;

				if (currObject && currObject.name) {
					const name = currObject.name;
					document.getElementById('focusNodeName').object3D.el.setAttribute('text',
						"value: " + name
						+ ";color: white; width: 2; font: https://cdn.aframe.io/fonts/DejaVu-sdf.fnt;");
					updateHudForNode(name, name, currObject.isSphereNode);
				} else if (!currObject || !currObject.name) {
					document.getElementById('focusNodeName').object3D.el.removeAttribute('text');
					updateHudForNode(null, null, false);
				}
			} else {
				document.getElementById('focusNodeName').object3D.el.removeAttribute('text');
				updateHudForNode(null, null, false);
			}

			if (that.direction && that.origin) {
				console.log('constructing ray');
				that.scene.remove(that.arrow);
				that.arrow = new THREE.ArrowHelper(that.direction, that.origin, 100, 0xd3d3d3);
				that.scene.add(that.arrow);
			}
		}

		window.requestAnimationFrame(render);
	},

	remove: function () {

	},
	pause: function () {

	},

	play: function () {

	}
});