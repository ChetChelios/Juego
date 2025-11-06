// Sistema completo de armas
// Guarda este archivo como: weapons.js

function initWeapons() {
    console.log('Inicializando armas...');
    
    // Inicializar estadísticas de cada arma
    for (let weaponName in CONFIG.weapons) {
        const weapon = CONFIG.weapons[weaponName];
        weaponStats[weaponName] = {
            ammo: weapon.maxAmmo,
            reserve: weapon.reserveAmmo
        };
    }
    
    console.log('Estadísticas de armas:', weaponStats);
    
    // Configurar imagen inicial
    const weapon = CONFIG.weapons[currentWeapon];
    const weaponImg = document.getElementById('currentWeaponImg');
    if (weaponImg) {
        weaponImg.src = weapon.image;
    }
    
    // Crear modelo 3D del arma
    createWeaponModel();
    
    console.log('Armas inicializadas correctamente');
}

function createWeaponModel() {
    const weaponGroup = new THREE.Group();
    
    // Cañón del arma
    const barrel = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.5),
        new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        })
    );
    barrel.position.z = -0.25;
    
    // Empuñadura
    const grip = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.2, 0.15),
        new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.5
        })
    );
    grip.position.y = -0.1;
    grip.position.z = 0.05;
    
    // Corredera
    const slide = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.1, 0.3),
        new THREE.MeshStandardMaterial({ 
            color: 0x444444,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    slide.position.y = 0.05;
    slide.position.z = -0.05;
    
    weaponGroup.add(barrel);
    weaponGroup.add(grip);
    weaponGroup.add(slide);
    
    // Posicionar el arma en la cámara
    weaponGroup.position.set(0.35, -0.3, -0.8);
    weaponGroup.rotation.y = -0.1;
    
    camera.add(weaponGroup);
    weaponModel = weaponGroup;
    
    updateWeaponModel();
}

function updateWeaponModel() {
    if (!weaponModel) return;
    
    const weapon = CONFIG.weapons[currentWeapon];
    
    // Cambiar color según el arma
    weaponModel.children.forEach(mesh => {
        if (mesh.material) {
            mesh.material.emissive = new THREE.Color(weapon.color);
            mesh.material.emissiveIntensity = 0.3;
        }
    });
    
    // Cambiar tamaño según el arma
    if (currentWeapon === 'shotgun') {
        weaponModel.scale.set(1.5, 1.2, 1.3);
    } else if (currentWeapon === 'rifle') {
        weaponModel.scale.set(0.9, 0.9, 1.4);
    } else {
        weaponModel.scale.set(1, 1, 1);
    }
}

function switchWeapon(weaponName) {
    if (currentWeapon === weaponName) return;
    
    currentWeapon = weaponName;
    const weapon = CONFIG.weapons[weaponName];
    
    // Actualizar UI
    document.querySelectorAll('.weapon-slot').forEach(slot => {
        slot.classList.remove('active');
    });
    document.getElementById(`weapon-${weaponName}`).classList.add('active');
    document.getElementById('weaponName').textContent = weapon.name;
    
    // Actualizar imagen del arma
    const weaponImg = document.getElementById('currentWeaponImg');
    if (weaponImg) {
        weaponImg.src = weapon.image;
        weaponImg.style.filter = `drop-shadow(0 0 15px ${getColorHex(weapon.color)})`;
    }
    
    updateAmmoDisplay();
    updateWeaponModel();
}

function getColorHex(colorNum) {
    return '#' + colorNum.toString(16).padStart(6, '0');
}

function animateWeaponRecoil() {
    if (!weaponModel) return;
    
    const recoilAmount = currentWeapon === 'shotgun' ? 0.15 : 
                        currentWeapon === 'rifle' ? 0.05 : 0.08;
    
    weaponModel.position.z += recoilAmount;
    
    setTimeout(() => {
        if (weaponModel) {
            weaponModel.position.z -= recoilAmount;
        }
    }, 80);
}