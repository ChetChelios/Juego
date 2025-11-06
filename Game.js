// Inicialización y bucle principal del juego

init();

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a); // Cielo nocturno
    
    camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0);
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Inicializar ambiente PRIMERO
    initEnvironment();
    
    // Reemplazar el suelo básico con uno mejorado
    const floorMat = createGround();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.receiveShadow = true;
    scene.add(floor);

    createWalls();
    // createObstacles(); // OBSTÁCULOS ELIMINADOS
    
    // Inicializar armas después de crear la escena y cámara
    setTimeout(() => {
        initWeapons();
    }, 100);

    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', onMouseMove);

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // Event listeners para selector de armas
    document.querySelectorAll('.weapon-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
            const weaponName = e.currentTarget.dataset.weapon;
            switchWeapon(weaponName);
        });
    });

    initAudio();
}

function onResize(){
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
}

function startGame(){
    const startScreen = document.getElementById('startScreen');
    startScreen.style.display = 'none';
    
    // Inicializar armas antes de empezar
    if (!weaponStats || Object.keys(weaponStats).length === 0) {
        initWeapons();
    }
    
    renderer.domElement.requestPointerLock();
    
    const onLockChange = () => {
        if (document.pointerLockElement === renderer.domElement){
            isPointerLocked = true;
            document.removeEventListener('pointerlockchange', onLockChange);
            
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            
            isGameActive = true;
            spawnWave();
            clock.start();
            animate();
        } else {
            // Si se pierde el pointer lock, mostrar el menú de inicio
            if (isGameActive) {
                isGameActive = false;
                startScreen.style.display = 'flex';
            }
        }
    };
    
    document.addEventListener('pointerlockchange', onLockChange);
}

function gameOver(){
    isGameActive = false;
    try{ document.exitPointerLock(); } catch(e){}
    document.getElementById('finalScore').textContent = 'PUNTUACIÓN: ' + score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function restartGame(){
    location.reload();
}

function animate(){
    if (!isGameActive) return;
    requestAnimationFrame(animate);
    
    const realDt = clock.getDelta();
    const isMoving = move.f || move.b || move.l || move.r;
    const target = isMoving ? CONFIG.timeFastTarget : CONFIG.timeSlowTarget;
    timeScale = THREE.MathUtils.lerp(timeScale, target, Math.min(1, CONFIG.timeLerpSpeed * realDt));
    const dt = realDt * timeScale;
    
    updateMovement(realDt);
    updateEnemies(dt);
    updateParticles(dt);
    updateEnvironment(dt); // Actualizar ambiente
    
    renderer.render(scene, camera);
}

function createWalls(){
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        metalness: 0.4,
        roughness: 0.6,
        emissive: 0x000033,
        emissiveIntensity: 0.2
    });
    const positions = [
        [0, 5, -90, 0],
        [0,5,90,0],
        [-90,5,0, Math.PI/2],
        [90,5,0, Math.PI/2]
    ];
    positions.forEach(p=>{
        const w = new THREE.Mesh(new THREE.BoxGeometry(200,10,2), mat);
        w.position.set(p[0], p[1], p[2]);
        w.rotation.y = p[3];
        w.receiveShadow = true;
        w.castShadow = true;
        scene.add(w);
    });
}

function createObstacles(){
    const mat = new THREE.MeshStandardMaterial({
        color:0x16213e,
        emissive:0x0f3460,
        emissiveIntensity:0.4,
        metalness: 0.6,
        roughness: 0.4
    });
    for (let i=0;i<28;i++){
        const s = Math.random()*3 + 1.0;
        const box = new THREE.Mesh(new THREE.BoxGeometry(s, s*1.8, s), mat);
        box.position.set(
            (Math.random()-0.5)*120,
            s*0.9,
            (Math.random()-0.5)*120
        );
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
        
        // Añadir luz en algunos obstáculos
        if (Math.random() > 0.7) {
            const light = new THREE.PointLight(0x00ffff, 0.5, 8);
            light.position.copy(box.position);
            light.position.y += s;
            scene.add(light);
        }
    }
}

updateAmmoDisplay();