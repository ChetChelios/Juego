// Sistema de movimiento y control del jugador

function updateMovement(dt){
    const targetSpeed = move.run ? CONFIG.player.runSpeed : CONFIG.player.walkSpeed;
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    // Obtener dirección frontal (solo rotación horizontal)
    forward.set(
        -Math.sin(yaw),
        0,
        -Math.cos(yaw)
    );
    
    // Obtener dirección derecha (perpendicular)
    right.set(
        Math.cos(yaw),
        0,
        -Math.sin(yaw)
    );
    
    const dir = new THREE.Vector3();
    if (move.f) dir.add(forward);
    if (move.b) dir.sub(forward);
    if (move.r) dir.add(right);
    if (move.l) dir.sub(right);

    if (dir.lengthSq() > 0){
        dir.normalize();
        const desired = dir.multiplyScalar(targetSpeed);
        velocity.x = THREE.MathUtils.lerp(velocity.x, desired.x, Math.min(1, 12 * dt));
        velocity.z = THREE.MathUtils.lerp(velocity.z, desired.z, Math.min(1, 12 * dt));
    } else {
        velocity.x = THREE.MathUtils.lerp(velocity.x, 0, Math.min(1, 12 * dt));
        velocity.z = THREE.MathUtils.lerp(velocity.z, 0, Math.min(1, 12 * dt));
    }

    velocity.y += CONFIG.player.gravity * dt;
    
    // Guardar posición anterior
    const oldPos = camera.position.clone();
    
    // Aplicar movimiento
    camera.position.add(velocity.clone().multiplyScalar(dt));
    
    // Verificar colisiones con edificios
    if (checkBuildingCollision()) {
        // Si hay colisión, volver a la posición anterior
        camera.position.copy(oldPos);
        velocity.x = 0;
        velocity.z = 0;
    }
    
    if (camera.position.y < 1.6){
        camera.position.y = 1.6;
        velocity.y = 0;
        grounded = true;
    }
    
    camera.position.x = Math.max(-180, Math.min(180, camera.position.x));
    camera.position.z = Math.max(-180, Math.min(180, camera.position.z));
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}

function checkBuildingCollision() {
    const playerRadius = 1.0; // Radio de colisión del jugador
    
    // Verificar colisión con cada edificio
    if (buildings && buildings.length > 0) {
        for (let building of buildings) {
            if (!building.userData.isBuilding) continue;
            
            const buildingPos = building.position;
            const halfWidth = building.userData.width / 2;
            const halfDepth = building.userData.depth / 2;
            
            // Calcular distancia en X y Z
            const dx = Math.abs(camera.position.x - buildingPos.x);
            const dz = Math.abs(camera.position.z - buildingPos.z);
            
            // Verificar si el jugador está dentro del área del edificio
            if (dx < halfWidth + playerRadius && dz < halfDepth + playerRadius) {
                return true; // Hay colisión
            }
        }
    }
    
    return false; // No hay colisión
}

function onKeyDown(e){
    if (!isGameActive) return;
    switch(e.code){
        case 'KeyW': move.f=true; break;
        case 'KeyS': move.b=true; break;
        case 'KeyA': move.l=true; break;
        case 'KeyD': move.r=true; break;
        case 'ShiftLeft': move.run=true; break;
        case 'Space':
            if (grounded){
                velocity.y = CONFIG.player.jumpVelocity;
                grounded=false;
            }
            break;
        case 'KeyR': reload(); break;
        case 'Digit1': switchWeapon('pistol'); break;
        case 'Digit2': switchWeapon('rifle'); break;
        case 'Digit3': switchWeapon('shotgun'); break;
    }
}

function onKeyUp(e){
    if (!isGameActive) return;
    switch(e.code){
        case 'KeyW': move.f=false; break;
        case 'KeyS': move.b=false; break;
        case 'KeyA': move.l=false; break;
        case 'KeyD': move.r=false; break;
        case 'ShiftLeft': move.run=false; break;
    }
}

function onMouseMove(e){
    if (!isPointerLocked) return;
    yaw -= e.movementX * mouseSensitivity;
    pitch -= e.movementY * mouseSensitivity;
    pitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, pitch));
}

function handleClick(){
    if (!isGameActive || !isPointerLocked) return;
    
    // Verificar que weaponStats esté inicializado
    if (!weaponStats || !weaponStats[currentWeapon]) {
        console.error('Armas no inicializadas');
        return;
    }
    
    const now = performance.now() / 1000;
    const weapon = CONFIG.weapons[currentWeapon];
    const stats = weaponStats[currentWeapon];
    
    if (stats.ammo <= 0) {
        console.log('Sin munición');
        return;
    }
    if (now - lastShotTime < weapon.fireRate) return;
    
    lastShotTime = now;
    stats.ammo--;
    updateAmmoDisplay();
    playShot();
    showMuzzleFlash();
    animateWeaponRecoil();
    
    // Escopeta dispara múltiples perdigones
    if (currentWeapon === 'shotgun') {
        for (let i = 0; i < weapon.pellets; i++) {
            shootRay(weapon.spread);
        }
    } else {
        shootRay(0.02);
    }
}

function shootRay(spreadAmount) {
    const weapon = CONFIG.weapons[currentWeapon];
    const origin = camera.position.clone();
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    // Agregar dispersión
    dir.x += (Math.random() - 0.5) * spreadAmount;
    dir.y += (Math.random() - 0.5) * spreadAmount;
    dir.normalize();
    
    raycaster.set(origin, dir);
    
    const hits = raycaster.intersectObjects(enemies.map(e => e.children[0]), true);
    if (hits.length > 0) {
        const hit = hits[0];
        const enemy = findEnemyFromMesh(hit.object);
        if (enemy) {
            enemy.userData.health -= weapon.damage;
            spawnHitEffect(hit.point);
            hitPulse();
            playHit();
            if (enemy.userData.health <= 0) {
                const idx = enemies.indexOf(enemy);
                if (idx >= 0) killEnemy(enemy, idx);
            }
        }
    }
}

function findEnemyFromMesh(mesh){
    let cur = mesh;
    while(cur){
        if (enemies.includes(cur)) return cur;
        cur = cur.parent;
    }
    return null;
}

function takeDamage(amount){
    health -= amount;
    health = Math.max(0, health);
    document.getElementById('healthFill').style.width = `${health}%`;
    document.getElementById('healthText').textContent = Math.floor(health);
    hitPulse();
    if (health <= 0) gameOver();
}

function updateAmmoDisplay(){
    const stats = weaponStats[currentWeapon];
    document.getElementById('ammoDisplay').textContent = `${stats.ammo} / ${stats.reserve}`;
}

function reload(){
    const weapon = CONFIG.weapons[currentWeapon];
    const stats = weaponStats[currentWeapon];
    const need = weapon.maxAmmo - stats.ammo;
    const take = Math.min(need, stats.reserve);
    if (take > 0){
        stats.reserve -= take;
        stats.ammo += take;
        updateAmmoDisplay();
    }
}