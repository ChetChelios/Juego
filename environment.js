// Sistema de ambiente y atmósfera del juego

function createSkybox() {
    // Crear un skybox más oscuro y realista
    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vWorldPosition;
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        uniforms: {
            topColor: { value: new THREE.Color(0x001133) }, // Azul muy oscuro
            bottomColor: { value: new THREE.Color(0x0a0a1a) }, // Casi negro
            offset: { value: 400 },
            exponent: { value: 0.6 }
        },
        side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
    return sky;
}

function createCityBuildings() {
    const buildings = [];
    
    // Edificios distribuidos DENTRO del área de juego
    const buildingPositions = [
        // Edificios cercanos
        [-60, 25, -60], [-40, 30, -50], [-70, 20, -40],
        [60, 28, -60], [50, 22, -50], [70, 35, -40],
        [-60, 30, 60], [-50, 25, 50], [-40, 28, 70],
        [60, 32, 60], [50, 27, 50], [40, 24, 70],
        
        // Edificios medianos
        [-30, 18, -70], [30, 20, -70],
        [-70, 22, -30], [70, 26, -30],
        [-70, 24, 30], [70, 21, 30],
        [-30, 19, 70], [30, 23, 70],
        
        // Edificios más lejanos pero dentro
        [-75, 40, 0], [75, 38, 0],
        [0, 35, -75], [0, 33, 75],
        
        // Edificios adicionales
        [-45, 28, -25], [45, 26, -25],
        [-25, 22, 45], [25, 24, 45]
    ];
    
    buildingPositions.forEach(pos => {
        const height = pos[1];
        const width = 8 + Math.random() * 8;
        const depth = 8 + Math.random() * 8;
        
        const buildingMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            metalness: 0.4,
            roughness: 0.7
        });
        
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(width, height * 2, depth),
            buildingMat
        );
        building.position.set(pos[0], height, pos[2]);
        building.castShadow = true;
        building.receiveShadow = true;
        
        // Datos de colisión
        building.userData.isBuilding = true;
        building.userData.width = width;
        building.userData.depth = depth;
        building.userData.height = height * 2;
        
        // Ventanas iluminadas
        addBuildingWindows(building, width, height * 2, depth);
        
        scene.add(building);
        buildings.push(building);
    });
    
    return buildings;
}

function addBuildingWindows(building, width, height, depth) {
    const windowGroup = new THREE.Group();
    
    // Ventanas SOLO en las 4 caras EXTERNAS
    const faces = [
        { axis: 'z', pos: depth / 2 + 0.05, rot: 0, w: width, h: height },      // Frente
        { axis: 'z', pos: -depth / 2 - 0.05, rot: Math.PI, w: width, h: height }, // Atrás
        { axis: 'x', pos: width / 2 + 0.05, rot: Math.PI/2, w: depth, h: height }, // Derecha
        { axis: 'x', pos: -width / 2 - 0.05, rot: -Math.PI/2, w: depth, h: height } // Izquierda
    ];
    
    faces.forEach(face => {
        const cols = Math.max(2, Math.floor(face.w / 2.5));
        const rows = Math.max(3, Math.floor(face.h / 3.5));
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (Math.random() > 0.4) { // 60% de ventanas encendidas
                    const windowLight = new THREE.Mesh(
                        new THREE.PlaneGeometry(0.5, 0.9),
                        new THREE.MeshBasicMaterial({ 
                            color: Math.random() > 0.6 ? 0xffff99 : 0x88ccff,
                            transparent: true,
                            opacity: 0.8
                        })
                    );
                    
                    const xOffset = (i - (cols - 1) / 2) * 2.5;
                    const yOffset = (j - (rows - 1) / 2) * 3.5;
                    
                    if (face.axis === 'z') {
                        windowLight.position.set(xOffset, yOffset, face.pos);
                        windowLight.rotation.y = face.rot;
                    } else {
                        windowLight.position.set(face.pos, yOffset, xOffset);
                        windowLight.rotation.y = face.rot;
                    }
                    
                    windowGroup.add(windowLight);
                }
            }
        }
    });
    
    building.add(windowGroup);
}

function createNeonLights() {
    // ELIMINADO - Ya no hay luces de neón en el suelo
    return [];
}

function animateNeonLights(neonLights, time) {
    // ELIMINADO - Ya no se animan luces de neón
}

function createFloatingParticles() {
    const particles = [];
    const particleCount = 80;
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.08, 4, 4);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x88ccff,
            transparent: true,
            opacity: 0.2
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(
            (Math.random() - 0.5) * 160,
            Math.random() * 40 + 5,
            (Math.random() - 0.5) * 160
        );
        
        particle.userData = {
            velocityY: Math.random() * 0.15 + 0.05,
            startY: particle.position.y
        };
        
        scene.add(particle);
        particles.push(particle);
    }
    
    return particles;
}

function updateFloatingParticles(particles, dt) {
    particles.forEach(p => {
        p.position.y += p.userData.velocityY * dt;
        
        if (p.position.y > p.userData.startY + 8) {
            p.position.y = p.userData.startY;
        }
        
        // Movimiento ondulante sutil
        p.position.x += Math.sin(performance.now() / 1500 + p.position.z) * 0.008;
    });
}

function createFog() {
    // Niebla más sutil
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.006);
}

function addAtmosphericLighting() {
    // Luz ambiental tenue
    const ambient = new THREE.AmbientLight(0x4488ff, 0.25);
    scene.add(ambient);
    
    // Luz direccional (luna)
    const moonLight = new THREE.DirectionalLight(0x6699ff, 0.4);
    moonLight.position.set(-20, 60, -20);
    moonLight.castShadow = true;
    moonLight.shadow.camera.left = -100;
    moonLight.shadow.camera.right = 100;
    moonLight.shadow.camera.top = 100;
    moonLight.shadow.camera.bottom = -100;
    scene.add(moonLight);
    
    // Luz de relleno muy sutil
    const fillLight = new THREE.PointLight(0xff2244, 0.2, 150);
    fillLight.position.set(0, 30, 0);
    scene.add(fillLight);
}

function createGround() {
    // Suelo con textura de circuitos cyberpunk
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Fondo oscuro
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Función para dibujar líneas de circuito
    function drawCircuitLine(x1, y1, x2, y2, color, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Función para dibujar nodos de circuito
    function drawNode(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Brillo interno
        ctx.fillStyle = color + '88';
        ctx.fillRect(x - size/3, y - size/3, size/1.5, size/1.5);
    }
    
    // Colores cyberpunk
    const colors = ['#00ffff', '#ff00ff', '#00ff00', '#ffff00'];
    
    // Grid base sutil
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 1024; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.stroke();
    }
    
    // Dibujar circuitos principales (líneas horizontales y verticales)
    for (let i = 0; i < 15; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startX = Math.random() * 1024;
        const startY = Math.random() * 1024;
        
        // Línea horizontal
        if (Math.random() > 0.5) {
            const endX = startX + (Math.random() * 400 + 100);
            drawCircuitLine(startX, startY, Math.min(endX, 1024), startY, color, 3);
            
            // Añadir ramificaciones
            const branches = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < branches; j++) {
                const branchX = startX + (endX - startX) * Math.random();
                const branchLength = Math.random() * 100 + 50;
                const direction = Math.random() > 0.5 ? 1 : -1;
                drawCircuitLine(branchX, startY, branchX, startY + branchLength * direction, color, 2);
            }
        } else {
            // Línea vertical
            const endY = startY + (Math.random() * 400 + 100);
            drawCircuitLine(startX, startY, startX, Math.min(endY, 1024), color, 3);
            
            // Añadir ramificaciones
            const branches = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < branches; j++) {
                const branchY = startY + (endY - startY) * Math.random();
                const branchLength = Math.random() * 100 + 50;
                const direction = Math.random() > 0.5 ? 1 : -1;
                drawCircuitLine(startX, branchY, startX + branchLength * direction, branchY, color, 2);
            }
        }
    }
    
    // Dibujar nodos en intersecciones
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        drawNode(x, y, size, color);
    }
    
    // Añadir chips/componentes pequeños
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Rectángulo del chip
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 10, y - 10, 20, 20);
        
        // Pines del chip
        ctx.lineWidth = 1;
        for (let j = 0; j < 4; j++) {
            // Pines izquierda
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 8 + j * 5);
            ctx.lineTo(x - 14, y - 8 + j * 5);
            ctx.stroke();
            
            // Pines derecha
            ctx.beginPath();
            ctx.moveTo(x + 10, y - 8 + j * 5);
            ctx.lineTo(x + 14, y - 8 + j * 5);
            ctx.stroke();
        }
    }
    
    // Añadir detalles brillantes
    ctx.shadowBlur = 10;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.shadowBlur = 0;
    
    // Crear textura
    const texture = new THREE.CanvasTexture(canvas);
    texture.repeat.set(10, 10);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    const floorMat = new THREE.MeshStandardMaterial({ 
        map: texture,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x001a2e,
        emissiveIntensity: 0.2
    });
    
    return floorMat;
}

// Variables globales del ambiente
let skybox, buildings, neonLights, floatingParticles;

function initEnvironment() {
    console.log('Inicializando ambiente...');
    
    // Crear cielo
    skybox = createSkybox();
    
    // Crear edificios de ciudad DENTRO del área
    buildings = createCityBuildings();
    
    // Ya NO crear luces de neón en el suelo
    neonLights = [];
    
    // Crear partículas flotantes
    floatingParticles = createFloatingParticles();
    
    // Configurar niebla
    createFog();
    
    // Mejorar iluminación
    addAtmosphericLighting();
    
    console.log('Ambiente inicializado');
}

function updateEnvironment(dt) {
    // Animar partículas flotantes
    if (floatingParticles) {
        updateFloatingParticles(floatingParticles, dt);
    }
}