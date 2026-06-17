import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("heroScene");

if (canvas) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallScreen = window.matchMedia("(max-width: 720px)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isSmallScreen,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const root = new THREE.Group();
    root.position.set(isSmallScreen ? 0.25 : 1.1, -0.25, 0);
    scene.add(root);

    const field = new THREE.Group();
    field.rotation.set(-0.03, -0.46, 0.02);
    root.add(field);

    const materials = {
        gridLine: new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.32,
            blending: THREE.AdditiveBlending
        }),
        border: new THREE.LineBasicMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending
        }),
        green: new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }),
        blue: new THREE.MeshBasicMaterial({
            color: 0x2563eb,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }),
        cyan: new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        }),
    };

    const createLine = (points, material = materials.gridLine) => {
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            material.clone()
        );
        return line;
    };

    const createLineSegments = (points, material = materials.gridLine) => {
        const lines = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(points),
            material.clone()
        );
        return lines;
    };

    const createPlane = (width, height, position, material) => {
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material.clone());
        plane.rotation.x = -Math.PI / 2;
        plane.position.copy(position);
        field.add(plane);
        return plane;
    };

    const createLabelTexture = (title, subtitle = "", accent = "#7dd3fc") => {
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = 512;
        textureCanvas.height = subtitle ? 160 : 112;
        const context = textureCanvas.getContext("2d");

        context.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
        context.fillStyle = "rgba(7, 17, 31, 0.64)";
        context.strokeStyle = "rgba(125, 211, 252, 0.36)";
        context.lineWidth = 2;
        context.beginPath();
        context.roundRect(8, 8, textureCanvas.width - 16, textureCanvas.height - 16, 18);
        context.fill();
        context.stroke();

        context.fillStyle = accent;
        context.font = "800 28px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
        context.fillText(title, 34, 54);

        if (subtitle) {
            context.fillStyle = "rgba(226, 239, 255, 0.84)";
            context.font = "600 22px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
            context.fillText(subtitle, 34, 100);
            context.fillStyle = "rgba(34, 197, 94, 0.84)";
            context.fillRect(34, 122, 160, 8);
        }

        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    };

    const createSprite = (title, subtitle, position, scale, accent) => {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: createLabelTexture(title, subtitle, accent),
            transparent: true,
            opacity: 0.82,
            depthWrite: false
        }));
        sprite.position.copy(position);
        sprite.scale.set(scale.x, scale.y, 1);
        root.add(sprite);
        return sprite;
    };

    const fieldWidth = 8.4;
    const fieldDepth = 5.6;
    const gridPoints = [];

    for (let x = -fieldWidth / 2; x <= fieldWidth / 2 + 0.001; x += 0.35) {
        gridPoints.push(new THREE.Vector3(x, 0, -fieldDepth / 2), new THREE.Vector3(x, 0, fieldDepth / 2));
    }

    for (let z = -fieldDepth / 2; z <= fieldDepth / 2 + 0.001; z += 0.35) {
        gridPoints.push(new THREE.Vector3(-fieldWidth / 2, 0, z), new THREE.Vector3(fieldWidth / 2, 0, z));
    }

    const grid = createLineSegments(gridPoints, materials.gridLine);
    grid.position.y = -0.55;
    field.add(grid);

    const border = createLineSegments([
        new THREE.Vector3(-fieldWidth / 2, -0.52, -fieldDepth / 2), new THREE.Vector3(fieldWidth / 2, -0.52, -fieldDepth / 2),
        new THREE.Vector3(fieldWidth / 2, -0.52, -fieldDepth / 2), new THREE.Vector3(fieldWidth / 2, -0.52, fieldDepth / 2),
        new THREE.Vector3(fieldWidth / 2, -0.52, fieldDepth / 2), new THREE.Vector3(-fieldWidth / 2, -0.52, fieldDepth / 2),
        new THREE.Vector3(-fieldWidth / 2, -0.52, fieldDepth / 2), new THREE.Vector3(-fieldWidth / 2, -0.52, -fieldDepth / 2),
        new THREE.Vector3(-fieldWidth / 2, -0.52, 0), new THREE.Vector3(fieldWidth / 2, -0.52, 0),
        new THREE.Vector3(0, -0.52, -fieldDepth / 2), new THREE.Vector3(0, -0.52, fieldDepth / 2)
    ], materials.border);
    field.add(border);

    const zones = [
        createPlane(1.8, 1.2, new THREE.Vector3(-3.1, -0.535, -1.85), materials.blue),
        createPlane(1.8, 1.2, new THREE.Vector3(3.1, -0.535, 1.85), materials.green),
        createPlane(1.1, 3.8, new THREE.Vector3(0, -0.538, 0), materials.cyan)
    ];

    const targetPoints = [
        [-3.1, -1.85, 0x38bdf8],
        [-1.3, -0.9, 0x7dd3fc],
        [0.1, 0.25, 0x22c55e],
        [1.6, 1.05, 0x7dd3fc],
        [3.1, 1.85, 0x22c55e],
        [2.6, -1.6, 0x2563eb],
        [-2.35, 1.55, 0xf8fbff]
    ];

    const pointMeshes = targetPoints.map(([x, z, color]) => {
        const point = new THREE.Mesh(
            new THREE.CylinderGeometry(0.075, 0.075, 0.035, 24),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            })
        );
        point.position.set(x, -0.49, z);
        field.add(point);
        return point;
    });

    const pathCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-3.6, -0.45, -2.05),
        new THREE.Vector3(-1.65, -0.4, -1.65),
        new THREE.Vector3(1.05, -0.4, 1.64),
        new THREE.Vector3(3.45, -0.43, 1.92)
    );

    const pathLine = createLine(
        pathCurve.getPoints(160),
        new THREE.LineBasicMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.68,
            blending: THREE.AdditiveBlending
        })
    );
    field.add(pathLine);

    const bezierPoints = [
        pathCurve.v0,
        pathCurve.v1,
        pathCurve.v2,
        pathCurve.v3
    ];

    const bezierControlLines = createLineSegments([
        pathCurve.v0, pathCurve.v1,
        pathCurve.v2, pathCurve.v3
    ], new THREE.LineBasicMaterial({
        color: 0xf8fbff,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending
    }));
    field.add(bezierControlLines);

    const bezierNodes = bezierPoints.map((point, index) => {
        const node = new THREE.Mesh(
            new THREE.CylinderGeometry(index === 0 || index === 3 ? 0.09 : 0.065, index === 0 || index === 3 ? 0.09 : 0.065, 0.035, 24),
            new THREE.MeshBasicMaterial({
                color: index === 0 || index === 3 ? 0x22c55e : 0xf8fbff,
                transparent: true,
                opacity: index === 0 || index === 3 ? 0.84 : 0.46,
                blending: THREE.AdditiveBlending
            })
        );
        node.position.copy(point);
        node.position.y += 0.02;
        field.add(node);
        return node;
    });

    const rememberBaseOpacity = (object) => {
        object.traverse((child) => {
            if (!child.material) {
                return;
            }
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                material.transparent = true;
                material.userData.baseOpacity = material.opacity;
            });
        });
    };

    const setVehicleOpacity = (vehicle, opacity) => {
        vehicle.chassis.visible = opacity > 0.012;
        vehicle.chassis.traverse((child) => {
            if (!child.material) {
                return;
            }
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                const baseOpacity = material.userData.baseOpacity ?? material.opacity;
                material.opacity = baseOpacity * opacity;
            });
        });
    };

    const createBaseVehicle = (accentColor = 0x38bdf8, bodyOpacity = 0.48) => {
        const chassis = new THREE.Group();
        const bodyMaterial = new THREE.MeshBasicMaterial({
            color: accentColor,
            transparent: true,
            opacity: bodyOpacity,
            blending: THREE.AdditiveBlending
        });
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0xf8fbff,
            transparent: true,
            opacity: 0.74,
            blending: THREE.AdditiveBlending
        });

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.5), bodyMaterial);
        body.position.y = 0.07;
        chassis.add(body);
        body.add(new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), edgeMaterial));

        const direction = createLine([
            new THREE.Vector3(0, 0.15, 0),
            new THREE.Vector3(0, 0.15, 0.42)
        ], new THREE.LineBasicMaterial({
            color: accentColor,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        }));
        chassis.add(direction);

        const halo = new THREE.Mesh(
            new THREE.RingGeometry(0.48, 0.52, 48),
            new THREE.MeshBasicMaterial({
                color: accentColor,
                transparent: true,
                opacity: 0.25,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.012;
        chassis.add(halo);

        return { chassis, edgeMaterial, halo };
    };

    const createXDriveChassis = () => {
        const { chassis, edgeMaterial, halo } = createBaseVehicle(0x0ea5e9, 0.48);
        const wheelMaterial = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.82,
            blending: THREE.AdditiveBlending
        });

        const wheelPositions = [
            [-0.34, 0.06, -0.34, Math.PI / 4],
            [0.34, 0.06, -0.34, -Math.PI / 4],
            [-0.34, 0.06, 0.34, -Math.PI / 4],
            [0.34, 0.06, 0.34, Math.PI / 4]
        ];

        const wheels = wheelPositions.map(([x, y, z, angle]) => {
            const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.34), wheelMaterial);
            wheel.position.set(x, y, z);
            wheel.rotation.y = angle;
            chassis.add(wheel);

            const wheelEdges = new THREE.LineSegments(new THREE.EdgesGeometry(wheel.geometry), edgeMaterial.clone());
            wheelEdges.material.opacity = 0.58;
            wheel.add(wheelEdges);
            return wheel;
        });

        rememberBaseOpacity(chassis);
        return { chassis, wheels, halo, type: "xdrive" };
    };

    const createTankChassis = () => {
        const { chassis, edgeMaterial, halo } = createBaseVehicle(0x2563eb, 0.5);
        const treadMaterial = new THREE.MeshBasicMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending
        });

        const treads = [-0.33, 0.33].map((x) => {
            const tread = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.72), treadMaterial);
            tread.position.set(x, 0.06, 0);
            chassis.add(tread);
            const treadEdges = new THREE.LineSegments(new THREE.EdgesGeometry(tread.geometry), edgeMaterial.clone());
            treadEdges.material.opacity = 0.5;
            tread.add(treadEdges);
            return tread;
        });

        rememberBaseOpacity(chassis);
        return { chassis, treads, halo, type: "tank" };
    };

    const createSwerveChassis = () => {
        const { chassis, edgeMaterial, halo } = createBaseVehicle(0x22c55e, 0.44);
        const moduleMaterial = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.74,
            blending: THREE.AdditiveBlending
        });
        const wheelMaterial = new THREE.MeshBasicMaterial({
            color: 0xf8fbff,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending
        });

        const modules = [
            [-0.31, -0.31],
            [0.31, -0.31],
            [-0.31, 0.31],
            [0.31, 0.31]
        ].map(([x, z]) => {
            const module = new THREE.Group();
            module.position.set(x, 0.07, z);
            chassis.add(module);

            const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 22), moduleMaterial);
            pod.rotation.x = Math.PI / 2;
            module.add(pod);

            const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.24), wheelMaterial);
            wheel.position.y = -0.01;
            module.add(wheel);
            wheel.add(new THREE.LineSegments(new THREE.EdgesGeometry(wheel.geometry), edgeMaterial.clone()));

            return { module, wheel };
        });

        rememberBaseOpacity(chassis);
        return { chassis, modules, halo, type: "swerve" };
    };

    const secondaryPaths = [
        [
            new THREE.Vector3(-3.5, -0.46, 1.85),
            new THREE.Vector3(-2.1, -0.43, 0.34),
            new THREE.Vector3(0.85, -0.43, 2.0),
            new THREE.Vector3(2.75, -0.44, -1.55)
        ],
        [
            new THREE.Vector3(-2.8, -0.47, -0.2),
            new THREE.Vector3(-0.96, -0.44, 1.35),
            new THREE.Vector3(1.15, -0.44, -1.62),
            new THREE.Vector3(3.2, -0.46, -0.6)
        ]
    ].map((points, index) => {
        const curve = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
        const line = createLine(
            curve.getPoints(90),
            new THREE.LineBasicMaterial({
                color: index === 0 ? 0x22c55e : 0x2563eb,
                transparent: true,
                opacity: 0.32,
                blending: THREE.AdditiveBlending
            })
        );
        field.add(line);
        return { curve, line };
    });

    const vehicles = [
        createTankChassis(),
        createXDriveChassis(),
        createSwerveChassis()
    ];
    vehicles.forEach((vehicle) => {
        field.add(vehicle.chassis);
        setVehicleOpacity(vehicle, 0);
    });

    const clamp01 = (value) => Math.min(1, Math.max(0, value));
    const smoothstep = (edge0, edge1, value) => {
        const t = clamp01((value - edge0) / (edge1 - edge0));
        return t * t * (3 - 2 * t);
    };

    const scanRings = [1.1, 1.75, 2.4, 3.1].map((radius, index) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.006, 8, 160),
            new THREE.MeshBasicMaterial({
                color: index % 2 === 0 ? 0x38bdf8 : 0x22c55e,
                transparent: true,
                opacity: 0.13,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0.1, -0.42 + index * 0.005, 0.22);
        field.add(ring);
        return ring;
    });

    const radarSweep = new THREE.Mesh(
        new THREE.CircleGeometry(3.15, 96, 0, Math.PI / 3.1),
        new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    );
    radarSweep.rotation.x = -Math.PI / 2;
    radarSweep.position.set(0.1, -0.47, 0.22);
    field.add(radarSweep);

    const sweepLine = createLine([
        new THREE.Vector3(0.1, -0.42, 0.22),
        new THREE.Vector3(3.25, -0.42, 0.22)
    ], new THREE.LineBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.68,
        blending: THREE.AdditiveBlending
    }));
    field.add(sweepLine);

    const statusSprites = [
        createSprite("FIELD MAP", "PATH ONLINE", new THREE.Vector3(2.5, 2.9, -2.9), new THREE.Vector3(1.9, 0.6, 1), "#7dd3fc"),
        createSprite("AUTO ROUTE", "7 NODES LOCKED", new THREE.Vector3(4.55, 1.65, 0.6), new THREE.Vector3(1.75, 0.56, 1), "#22c55e"),
        createSprite("HUE-VEX", "CONTROL SURFACE", new THREE.Vector3(1.0, 3.72, -2.6), new THREE.Vector3(2.2, 0.68, 1), "#f8fbff")
    ];

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = isSmallScreen ? 90 : 190;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        particlePositions[i3] = (Math.random() - 0.5) * 12;
        particlePositions[i3 + 1] = Math.random() * 4.4 - 0.2;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 7;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
            color: 0x7dd3fc,
            size: 0.025,
            transparent: true,
            opacity: 0.66,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    root.add(particles);

    scene.add(new THREE.AmbientLight(0xb9d9ff, 0.75));

    const blueLight = new THREE.PointLight(0x38bdf8, 8, 14);
    blueLight.position.set(-3.2, 1.7, 2.8);
    scene.add(blueLight);

    const greenLight = new THREE.PointLight(0x22c55e, 5.5, 12);
    greenLight.position.set(3.4, 2.2, -2.2);
    scene.add(greenLight);

    const pointer = { x: 0, y: 0 };
    window.addEventListener("pointermove", (event) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const resize = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.35 : 1.85);

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.set(isSmallScreen ? 5.4 : 5.8, isSmallScreen ? 4.7 : 4.45, isSmallScreen ? 7.6 : 7.05);
        camera.updateProjectionMatrix();
    };

    const clock = new THREE.Clock();
    let running = true;

    document.addEventListener("visibilitychange", () => {
        running = document.visibilityState !== "hidden";
        if (running) {
            clock.getDelta();
            requestAnimationFrame(animate);
        }
    });

    const animate = () => {
        if (!running) {
            return;
        }

        const elapsed = clock.getElapsedTime();
        const delta = Math.min(clock.getDelta(), 0.033);
        const motionScale = reducedMotion ? 0.18 : 1;

        field.rotation.y = -0.46 + pointer.x * 0.08 + Math.sin(elapsed * 0.18) * 0.02;
        field.rotation.x = -0.03 + pointer.y * 0.025;

        grid.position.z = ((elapsed * 0.28 * motionScale) % 0.7) - 0.35;
        border.material.opacity = 0.62 + Math.sin(elapsed * 1.4) * 0.1;

        zones.forEach((zone, index) => {
            zone.material.opacity = 0.12 + Math.sin(elapsed * 1.3 + index) * 0.035;
        });

        pointMeshes.forEach((point, index) => {
            const pulse = 0.82 + Math.sin(elapsed * 3.4 + index * 0.8) * 0.22;
            point.scale.set(pulse, 1, pulse);
            point.material.opacity = 0.55 + pulse * 0.26;
        });

        const segmentDuration = reducedMotion ? 18 : 12;
        const sequenceTime = (elapsed * motionScale) / segmentDuration;
        const activeIndex = Math.floor(sequenceTime) % vehicles.length;
        const segmentProgress = sequenceTime - Math.floor(sequenceTime);
        const travelT = smoothstep(0.08, 0.9, segmentProgress);
        const vehicleFade = smoothstep(0.02, 0.16, segmentProgress) * (1 - smoothstep(0.84, 0.98, segmentProgress));
        const chassisPosition = pathCurve.getPointAt(travelT);
        const chassisTangent = pathCurve.getTangentAt(travelT);
        const heading = Math.atan2(chassisTangent.x, chassisTangent.z);

        vehicles.forEach((vehicle, index) => {
            const easedOpacity = index === activeIndex ? vehicleFade : 0;

            vehicle.chassis.position.copy(chassisPosition);
            vehicle.chassis.position.y += 0.12 + index * 0.006;
            vehicle.chassis.rotation.y = heading;
            vehicle.chassis.scale.setScalar((0.88 + Math.sin(elapsed * 3.2 + index) * 0.025) * (0.96 + easedOpacity * 0.04));
            setVehicleOpacity(vehicle, easedOpacity);

            if (vehicle.halo) {
                vehicle.halo.rotation.z += delta * (1.2 + index * 0.28) * motionScale;
            }

            if (vehicle.type === "tank") {
                vehicle.treads.forEach((tread, treadIndex) => {
                    tread.scale.z = 1 + Math.sin(elapsed * 8 + treadIndex * Math.PI) * 0.06;
                });
            }

            if (vehicle.type === "xdrive") {
                vehicle.wheels.forEach((wheel, wheelIndex) => {
                    wheel.scale.z = 1 + Math.sin(elapsed * 7 + wheelIndex) * 0.08;
                });
            }

            if (vehicle.type === "swerve") {
                vehicle.modules.forEach(({ module, wheel }, moduleIndex) => {
                    module.rotation.y = Math.sin(elapsed * 1.8 + moduleIndex * 0.8) * 0.42;
                    wheel.scale.z = 1 + Math.sin(elapsed * 8 + moduleIndex) * 0.06;
                });
            }
        });

        pathLine.material.opacity = 0.52 + Math.sin(elapsed * 1.6) * 0.14;
        secondaryPaths.forEach(({ line }, index) => {
            line.material.opacity = 0.2 + Math.sin(elapsed * 1.25 + index) * 0.08;
        });

        radarSweep.rotation.z += delta * 0.55 * motionScale;
        radarSweep.material.opacity = 0.075 + Math.sin(elapsed * 1.8) * 0.035;
        sweepLine.rotation.y = radarSweep.rotation.z;
        sweepLine.material.opacity = 0.48 + Math.sin(elapsed * 2.5) * 0.14;

        scanRings.forEach((ring, index) => {
            ring.rotation.z += delta * (0.12 + index * 0.035) * motionScale;
            ring.material.opacity = 0.09 + Math.sin(elapsed * 1.1 + index * 0.7) * 0.045;
        });

        bezierNodes.forEach((node, index) => {
            const pulse = 0.9 + Math.sin(elapsed * 2.2 + index) * 0.12;
            node.scale.set(pulse, 1, pulse);
            node.material.opacity = (index === 0 || index === 3 ? 0.68 : 0.34) + Math.sin(elapsed * 1.8 + index) * 0.08;
        });

        statusSprites.forEach((sprite, index) => {
            sprite.position.y += Math.sin(elapsed * 1.2 + index) * 0.0008;
            sprite.material.opacity = 0.72 + Math.sin(elapsed * 1.4 + index) * 0.08;
        });

        particles.rotation.y += delta * 0.035 * motionScale;
        blueLight.intensity = 6.5 + Math.sin(elapsed * 2.3) * 1.8;
        greenLight.intensity = 4.8 + Math.cos(elapsed * 2.1) * 1.2;

        camera.lookAt(0.45 + pointer.x * 0.16, 0.4 - pointer.y * 0.08, 0);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize, { passive: true });
    resize();
    animate();
}
