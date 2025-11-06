// Sistema de audio del juego
let audioCtx, masterGain;

function initAudio(){
    try{
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.3;
        masterGain.connect(audioCtx.destination);
    }catch(e){
        console.warn('Audio no disponible');
        audioCtx = null;
    }
}

function playShot(){
    if (!audioCtx) return;
    const weapon = CONFIG.weapons[currentWeapon];
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = weapon.sound.type;
    o.frequency.value = weapon.sound.freq + Math.random()*120;
    g.gain.value = 0.001;
    o.connect(g);
    g.connect(masterGain);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.6, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
    o.stop(audioCtx.currentTime + 0.16);
}

function playHit(){
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 220;
    g.gain.value = 0.2;
    o.connect(g);
    g.connect(masterGain);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    o.stop(audioCtx.currentTime + 0.1);
}

function playDamage(){
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type='sine';
    o.frequency.value = 120;
    g.gain.value = 0.5;
    o.connect(g);
    g.connect(masterGain);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    o.stop(audioCtx.currentTime + 0.26);
}