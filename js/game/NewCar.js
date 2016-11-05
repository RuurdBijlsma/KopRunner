class NewCar { //letterlijk kopie
    constructor(scene, x = 0, y = 0, z = 0, color = 'red') {
        let car = this;
        scene.addEventListener(
            'update',
            function() {
                if (window.input && car.vehicle) {
                    if (window.input.direction !== null) {
                        window.input.steering += window.input.direction / 50;
                        if (window.input.steering < -.6) window.input.steering = -.6;
                        if (window.input.steering > .6) window.input.steering = .6;
                    }
                    car.vehicle.setSteering(window.input.steering, 0);
                    car.vehicle.setSteering(window.input.steering, 1);
                    if (window.input.power === true) {
                        console.log('input');
                        car.vehicle.applyEngineForce(200);
                    } else if (window.input.power === false) {
                        car.vehicle.setBrake(20, 2);
                        car.vehicle.setBrake(20, 3);
                    } else {
                        car.vehicle.applyEngineForce(0);
                    }
                }
                scene.simulate();
            }
        );

        var ground_material = new THREE.MeshStandardMaterial({ color: 'green' });


        var ground_geometry = new THREE.BoxGeometry(300, 5, 300);

        var ground = new Physijs.BoxMesh(
            ground_geometry,
            ground_material,
            0 // mass
        );
        ground.position.y = -4;
        ground.receiveShadow = true;
        scene.add(ground);

        // var controls = new THREE.OrbitControls(camera, renderer.domElement);

        var mesh = new Physijs.BoxMesh(
            new THREE.BoxGeometry(3, 1.5, 6),
            new THREE.MeshStandardMaterial({
                color: 'red'
            })
        );
        mesh.position.y = 4;
        mesh.castShadow = mesh.receiveShadow = true;




        this.vehicle = new Physijs.Vehicle(mesh, new Physijs.VehicleTuning(
            10.88,
            1.83,
            0.28,
            500,
            10.5,
            6000
        ));
        scene.add(this.vehicle);

        var wheel_material = new THREE.MeshStandardMaterial({
            color: 'black'
        });

        let wheels = {
            frontLeft: {
                position: new THREE.Vector3(1.2, -1, 2)
            },
            frontRight: {
                position: new THREE.Vector3(-1.2, -1, 2)
            },
            backLeft: {
                position: new THREE.Vector3(1.2, -1, -2)
            },
            backRight: {
                position: new THREE.Vector3(-1.2, -1, -2)
            }
        }

        let wheelRadius = 0.7;
        let wheel = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.6, 20);
        for (let position in wheels) {
            let wheelPos = wheels[position].position;
            this.vehicle.addWheel(
                wheel,
                wheel_material,
                wheelPos,
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(-1, 0, 0),
                0.5,
                wheelRadius,
                position.includes('front')
            );
        }
        scene.camera.position.copy(this.vehicle.mesh.position).add(new THREE.Vector3(40, 25, 40));
        scene.camera.lookAt(new THREE.Vector3);

        let l = new THREE.AmbientLight();
        l.intensity = 0.6;
        scene.add(l);


        window.input = {
            power: null,
            direction: null,
            steering: 0
        };
        document.addEventListener('keydown', function(ev) {
            switch (ev.keyCode) {
                case 37: // left
                    window.input.direction = 1;
                    break;

                case 38: // forward
                    window.input.power = true;
                    break;

                case 39: // right
                    window.input.direction = -1;
                    break;

                case 40: // back
                    window.input.power = false;
                    break;
            }
        });
        document.addEventListener('keyup', function(ev) {
            switch (ev.keyCode) {
                case 37: // left
                    window.input.direction = null;
                    break;

                case 38: // forward
                    window.input.power = null;
                    break;

                case 39: // right
                    window.input.direction = null;
                    break;

                case 40: // back
                    window.input.power = null;
                    break;
            }
        });

        scene.simulate();
    }
}
