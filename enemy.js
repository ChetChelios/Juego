// Sistema de enemigos y oleadas

function createEnemy(x,z){
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color:0xff3333 });
    
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9,1.6,0.6), mat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);
    
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35,8,8), mat);
    head.position.y = 2.0;
    head.castShadow = true;
    group.add(head);
    
    group.position.set(x,0,z);
    group.userData = {
        health:100,
        speed: CONFIG.enemy.baseSpeed,
        state:'patrol',
        patrolDir: new THREE.Vector3(Math.random()-0.5,0,Math.random()-0.5).normalize(),
        lastShot:0,
        patrolTime: Math.random()*4+2
    };
    
    scene.add(group);
    enemies.push(group);
    updateEnemyCount();
}

function spawnWave(){
    const count = 3 + wave*2;
    for (let i=0;i<count;i++){
        const angle = (Math.PI*2*i)/count;
        const radius = 22 + Math.random()*6;
        const x = Math.cos(angle)*radius;
        const z = Math.sin(angle)*radius;
        createEnemy(x,z);
    }
    document.getElementById('waveNumber').textContent = wave;
}

function updateEnemies(dt){
    const now = performance.now()/1000;
    for (let i = enemies.length - 1; i >= 0; i--){
        const en = enemies[i];
        const data = en.userData;
        
        const playerPos = camera.position.clone();
        const toPlayer = playerPos.sub(en.position);
        toPlayer.y = 0;
        const dist = toPlayer.length();
        const dir = toPlayer.clone().normalize();
        
        if (data.state === 'patrol'){
            en.position.add(data.patrolDir.clone().multiplyScalar(data.speed * dt));
            data.patrolTime -= dt;
            if (data.patrolTime <= 0){
                data.patrolDir = new THREE.Vector3(Math.random()-0.5,0,Math.random()-0.5).normalize();
                data.patrolTime = Math.random()*4+2;
            }
            if (dist < CONFIG.enemy.shootRange) data.state = 'chase';
        } else if (data.state === 'chase'){
            const desired = dir.clone().multiplyScalar(CONFIG.enemy.chaseSpeed);
            en.position.add(desired.multiplyScalar(dt));
            const lookAtPos = camera.position.clone();
            lookAtPos.y = en.position.y;
            en.lookAt(lookAtPos);
            
            if (dist < CONFIG.enemy.attackRange) data.state = 'attack';
            else if (dist > CONFIG.enemy.shootRange * 1.3) data.state = 'patrol';
        } else if (data.state === 'attack'){
            const perp = new THREE.Vector3(-dir.z,0,dir.x).multiplyScalar(0.3);
            en.position.add(dir.clone().multiplyScalar(0.6 * dt));
            en.position.add(perp.multiplyScalar(Math.sin(performance.now()/200) * 0.2));
            
            if (dist > CONFIG.enemy.attackRange*1.15) data.state = 'chase';
            if (dist < 1.5) takeDamage(8*dt);
        }
        
        if (dist < CONFIG.enemy.shootRange){
            if (now - data.lastShot > CONFIG.enemy.shootCooldown){
                data.lastShot = now;
                enemyDoShoot(en);
            }
        }
    }
}

function enemyDoShoot(enemy){
    const spread = (Math.random()-0.5) * 0.12;
    const origin = enemy.position.clone();
    origin.y += 1.4;
    const dir = new THREE.Vector3().subVectors(camera.position, origin).normalize();
    dir.x += spread;
    dir.y += (Math.random()-0.5)*0.02;
    dir.normalize();
    
    raycaster.set(origin, dir);
    
    const toPlayer = camera.position.clone().sub(origin);
    const proj = toPlayer.dot(dir);
    if (proj > 0 && proj < 40){
        const closest = origin.clone().add(dir.clone().multiplyScalar(proj));
        const d = closest.distanceTo(camera.position);
        if (d < 1.2){
            takeDamage(12);
            playDamage();
        }
    }
}

function killEnemy(enemy, idx){
    createExplosion(enemy.position);
    scene.remove(enemy);
    enemies.splice(idx,1);
    score += 100;
    document.getElementById('score').textContent = 'PUNTOS: ' + score;
    updateEnemyCount();
    if (enemies.length === 0){
        wave++;
        setTimeout(()=> spawnWave(), 1000);
    }
}

function updateEnemyCount(){
    document.getElementById('enemyCount').textContent = enemies.length;
}