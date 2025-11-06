// Sistema de efectos visuales y partículas

function createExplosion(pos){
    for (let i=0;i<16;i++){
        const p = new THREE.Mesh(
            new THREE.SphereGeometry(0.06,6,6),
            new THREE.MeshBasicMaterial({ color: 0xff2200 })
        );
        p.position.copy(pos);
        p.userData = {
            velocity: new THREE.Vector3(
                (Math.random()-0.5)*6,
                Math.random()*5,
                (Math.random()-0.5)*6
            ),
            life: 0.9
        };
        scene.add(p);
        particles.push(p);
    }
}

function spawnHitEffect(pos){
    const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.06,6,6),
        new THREE.MeshBasicMaterial({ color:0xffff00 })
    );
    p.position.copy(pos);
    p.userData = {
        life: 0.45,
        velocity: new THREE.Vector3(
            (Math.random()-0.5)*1,
            Math.random()*1.2,
            (Math.random()-0.5)*1
        )
    };
    scene.add(p);
    particles.push(p);
}

function updateParticles(dt){
    for (let i = particles.length - 1; i >= 0; i--){
        const p = particles[i];
        p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
        p.userData.velocity.y += CONFIG.player.gravity * 0.4 * dt;
        p.userData.life -= dt;
        if (p.userData.life <= 0){
            scene.remove(p);
            particles.splice(i,1);
        }
    }
}

function showMuzzleFlash(){
    const weapon = CONFIG.weapons[currentWeapon];
    const flash = new THREE.PointLight(weapon.color, 1.6, 8);
    const fw = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    const pos = camera.position.clone().add(fw.clone().multiplyScalar(1.0));
    flash.position.copy(pos);
    scene.add(flash);
    setTimeout(()=> scene.remove(flash), 60);
}

function hitPulse(){
    const el = document.getElementById('hitIndicator');
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
}