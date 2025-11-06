// Configuración global del juego
const CONFIG = {
    player: { 
        walkSpeed: 6, 
        runSpeed: 12, 
        jumpVelocity: 7, 
        gravity: -30 
    },
    enemy: { 
        baseSpeed: 2.2, 
        chaseSpeed: 4.2, 
        attackRange: 2.0, 
        shootRange: 18, 
        shootCooldown: 1.5 
    },
    timeSlowTarget: 0.25, 
    timeFastTarget: 1.0, 
    timeLerpSpeed: 2.5,
    weapons: {
        pistol: {
            name: 'PISTOLA',
            damage: 55,
            maxAmmo: 12,
            reserveAmmo: 60,
            fireRate: 0.3,
            color: 0x00ff00,
            sound: { type: 'triangle', freq: 880 },
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect x="80" y="60" width="100" height="15" fill="%23333" rx="3"/><rect x="60" y="75" width="30" height="40" fill="%23222" rx="5"/><rect x="85" y="50" width="90" height="20" fill="%23444" rx="2"/><circle cx="170" cy="67" r="8" fill="%2300ff00"/></svg>'
        },
        rifle: {
            name: 'RIFLE',
            damage: 35,
            maxAmmo: 30,
            reserveAmmo: 120,
            fireRate: 0.15,
            color: 0x00ffff,
            sound: { type: 'sawtooth', freq: 440 },
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect x="50" y="65" width="130" height="12" fill="%23333" rx="2"/><rect x="60" y="77" width="25" height="35" fill="%23222" rx="4"/><rect x="160" y="60" width="15" height="22" fill="%23444"/><rect x="85" y="55" width="70" height="25" fill="%23555" rx="3"/><circle cx="170" cy="70" r="6" fill="%2300ffff"/></svg>'
        },
        shotgun: {
            name: 'ESCOPETA',
            damage: 25,
            maxAmmo: 6,
            reserveAmmo: 30,
            fireRate: 0.8,
            pellets: 8,
            spread: 0.15,
            color: 0xff0000,
            sound: { type: 'square', freq: 220 },
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect x="70" y="60" width="110" height="20" fill="%23333" rx="4"/><rect x="50" y="70" width="30" height="45" fill="%23222" rx="6"/><rect x="90" y="50" width="80" height="35" fill="%23444" rx="3"/><rect x="160" y="65" width="20" height="15" fill="%23ff0000"/></svg>'
        }
    }
};

// Variables globales del juego
let scene, camera, renderer, clock;
let isGameActive = false, isPointerLocked = false;
let enemies = [], particles = [];
let score = 0, wave = 1;
let health = 100;
let move = { f: false, b: false, l: false, r: false, run: false };
let yaw = 0, pitch = 0;
let timeScale = 1.0;
let mouseSensitivity = 0.0025;
let velocity = new THREE.Vector3();
let grounded = true;
const raycaster = new THREE.Raycaster();

// Sistema de armas
let currentWeapon = 'pistol';
let weaponStats = {};
let lastShotTime = 0;
let weaponModel = null;