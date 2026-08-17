import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================
   DEADZONE
   THREE.JS GAME
========================= */

let scene;
let camera;
let renderer;

let player;
let weapon;

let zombies = [];
let bullets = [];

let keys = {};

let health = 100;
let ammo = 12;
let reserveAmmo = 60;

let score = 0;
let level = 1;

let gameStarted = false;
let gameOver = false;

let velocityY = 0;
let grounded = true;

const clock = new THREE.Clock();

/* =========================
   INITIALIZE
========================= */

function init() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x061009);

    scene.fog = new THREE.FogExp2(
        0x061009,
        0.025
    );

    /* CAMERA */

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    /* RENDERER */

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;

    document.body.appendChild(
        renderer.domElement
    );

    /* LIGHT */

    const ambient = new THREE.HemisphereLight(
        0x9ab8a0,
        0x101010,
        1.4
    );

    scene.add(ambient);

    const moon = new THREE.DirectionalLight(
        0xaacbff,
        2
    );

    moon.position.set(
        -40,
        70,
        -30
    );

    moon.castShadow = true;

    scene.add(moon);

    /* PLAYER */

    player = new THREE.Object3D();

    player.position.set(
        0,
        0,
        10
    );

    scene.add(player);

    camera.position.set(
        0,
        1.65,
        0
    );

    player.add(camera);

    /* WORLD */

    createGround();
    createForest();
    createWeapon();

    /* CONTROLS */

    window.addEventListener(
        "keydown",
        keyDown
    );

    window.addEventListener(
        "keyup",
        keyUp
    );

    window.addEventListener(
        "mousedown",
        mouseDown
    );

    window.addEventListener(
        "resize",
        resize
    );

    /* START BUTTON */

    const startButton =
        document.getElementById("startButton");

    if (startButton) {

        startButton.addEventListener(
            "click",
            startGame
        );

    }

    animate();
}


/* =========================
   GROUND
========================= */

function createGround() {

    const geometry =
        new THREE.PlaneGeometry(
            300,
            300
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x172218,
            roughness: 1
        });

    const ground =
        new THREE.Mesh(
            geometry,
            material
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);
}


/* =========================
   FOREST
========================= */

function createTree(x, z) {

    const tree =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.3,
                0.5,
                5,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x3b291c
            })
        );

    trunk.position.y = 2.5;

    const leaves =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                2.5,
                6,
                9
            ),
            new THREE.MeshStandardMaterial({
                color: 0x12391f
            })
        );

    leaves.position.y = 6;

    tree.add(
        trunk,
        leaves
    );

    tree.position.set(
        x,
        0,
        z
    );

    tree.traverse(
        object => {

            if (object.isMesh) {

                object.castShadow = true;
                object.receiveShadow = true;

            }

        }
    );

    scene.add(tree);
}


function createForest() {

    for (let i = 0; i < 100; i++) {

        const x =
            (Math.random() - 0.5) * 260;

        const z =
            (Math.random() - 0.5) * 260;

        if (
            Math.abs(x) < 15 &&
            Math.abs(z) < 15
        ) {

            continue;

        }

        createTree(x, z);

    }
}


/* =========================
   WEAPON
========================= */

function createWeapon() {

    weapon =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.3,
                0.3,
                1.2
            ),
            new THREE.MeshStandardMaterial({
                color: 0x151719,
                metalness: 0.8,
                roughness: 0.3
            })
        );

    body.position.set(
        0.4,
        -0.35,
        -0.7
    );

    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.055,
                0.055,
                1.3,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0x080909,
                metalness: 0.9
            })
        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.set(
        0.4,
        -0.33,
        -1.35
    );

    weapon.add(
        body,
        barrel
    );

    camera.add(weapon);
}


/* =========================
   ZOMBIE
========================= */

function createZombie() {

    const zombie =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.45,
                0.55,
                1.4,
                10
            ),
            new THREE.MeshStandardMaterial({
                color: 0x526c50
            })
        );

    body.position.y = 1;

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.43,
                16,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0x71866d
            })
        );

    head.position.y = 2;

    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff2438
        });

    const eye1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.07,
                8,
                8
            ),
            eyeMaterial
        );

    const eye2 = eye1.clone();

    eye1.position.set(
        -0.15,
        2.05,
        -0.38
    );

    eye2.position.set(
        0.15,
        2.05,
        -0.38
    );

    zombie.add(
        body,
        head,
        eye1,
        eye2
    );

    const angle =
        Math.random() *
        Math.PI * 2;

    const distance =
        25 +
        Math.random() * 35;

    zombie.position.set(
        player.position.x +
        Math.cos(angle) * distance,

        0,

        player.position.z +
        Math.sin(angle) * distance
    );

    zombie.userData = {

        hp: 100,

        speed:
            1.3 +
            level * 0.15,

        attackCooldown: 0

    };

    zombie.traverse(
        object => {

            if (object.isMesh) {

                object.castShadow = true;

            }

        }
    );

    scene.add(zombie);

    zombies.push(zombie);
}


/* =========================
   SHOOT
========================= */

function shoot() {

    if (
        !gameStarted ||
        gameOver ||
        ammo <= 0
    ) {

        return;

    }

    ammo--;

    updateHUD();

    const raycaster =
        new THREE.Raycaster();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const hits =
        raycaster.intersectObjects(
            zombies,
            true
        );

    if (hits.length === 0) {

        return;

    }

    let target =
        hits[0].object;

    while (
        target.parent &&
        !zombies.includes(target)
    ) {

        target =
            target.parent;

    }

    if (
        target.userData &&
        typeof target.userData.hp === "number"
    ) {

        target.userData.hp -= 35;

        if (
            target.userData.hp <= 0
        ) {

            killZombie(target);

        }

    }
}


/* =========================
   KILL ZOMBIE
========================= */

function killZombie(zombie) {

    score += 100;

    scene.remove(zombie);

    zombies =
        zombies.filter(
            z => z !== zombie
        );

    updateHUD();

}


/* =========================
   MOVEMENT
========================= */

function movement(dt) {

    if (!gameStarted || gameOver) {

        return;

    }

    const speed = 7;

    if (keys["w"]) {

        player.translateZ(
            -speed * dt
        );

    }

    if (keys["s"]) {

        player.translateZ(
            speed * dt
        );

    }

    if (keys["a"]) {

        player.translateX(
            -speed * dt
        );

    }

    if (keys["d"]) {

        player.translateX(
            speed * dt
        );

    }

    /* GRAVITY */

    velocityY -=
        20 * dt;

    camera.position.y +=
        velocityY * dt;

    if (
        camera.position.y <= 1.65
    ) {

        camera.position.y = 1.65;

        velocityY = 0;

        grounded = true;

    }

}


/* =========================
   JUMP
========================= */

function jump() {

    if (
        grounded &&
        gameStarted &&
        !gameOver
    ) {

        velocityY = 8;

        grounded = false;

    }

}


/* =========================
   ZOMBIE AI
========================= */

function updateZombies(dt) {

    zombies.forEach(
        zombie => {

            const direction =
                new THREE.Vector3()
                    .subVectors(
                        player.position,
                        zombie.position
                    );

            direction.y = 0;

            const distance =
                direction.length();

            if (distance > 2) {

                direction.normalize();

                zombie.position.add(
                    direction.multiplyScalar(
                        zombie.userData.speed * dt
                    )
                );

                zombie.lookAt(
                    player.position.x,
                    zombie.position.y,
                    player.position.z
                );

            }

            zombie.userData.attackCooldown -= dt;

            if (
                distance < 2.5 &&
                zombie.userData.attackCooldown <= 0
            ) {

                zombie.userData.attackCooldown = 1;

                health -= 8;

                health =
                    Math.max(
                        0,
                        health
                    );

                updateHUD();

                if (health <= 0) {

                    endGame();

                }

            }

        }
    );

}


/* =========================
   SPAWNING
========================= */

let spawnTimer = 0;

function spawnLogic(dt) {

    spawnTimer -= dt;

    const maximum =
        4 + level * 2;

    if (
        spawnTimer <= 0 &&
        zombies.length < maximum
    ) {

        createZombie();

        spawnTimer =
            Math.max(
                0.5,
                1.5 - level * 0.1
            );

    }

}


/* =========================
   KEYBOARD
========================= */

function keyDown(event) {

    const key =
        event.key.toLowerCase();

    keys[key] = true;

    if (
        event.code === "Space"
    ) {

        event.preventDefault();

        jump();

    }

    if (key === "r") {

        reload();

    }

}


function keyUp(event) {

    keys[
        event.key.toLowerCase()
    ] = false;

}


/* =========================
   MOUSE
========================= */

function mouseDown(event) {

    if (
        event.button === 0
    ) {

        shoot();

    }

}


/* =========================
   RELOAD
========================= */

function reload() {

    if (
        ammo >= 12 ||
        reserveAmmo <= 0
    ) {

        return;

    }

    const needed =
        12 - ammo;

    const amount =
        Math.min(
            needed,
            reserveAmmo
        );

    ammo += amount;

    reserveAmmo -= amount;

    updateHUD();

}


/* =========================
   START
========================= */

function startGame() {

    gameStarted = true;
    gameOver = false;

    const screen =
        document.getElementById(
            "startScreen"
        );

    if (screen) {

        screen.style.display =
            "none";

    }

    updateHUD();

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameOver = true;

    const screen =
        document.getElementById(
            "gameOver"
        );

    if (screen) {

        screen.style.display =
            "flex";

    }

}


/* =========================
   HUD
========================= */

function updateHUD() {

    const healthBar =
        document.getElementById(
            "health"
        );

    const ammoText =
        document.getElementById(
            "ammo"
        );

    const scoreText =
        document.getElementById(
            "score"
        );

    const levelText =
        document.getElementById(
            "level"
        );

    if (healthBar) {

        healthBar.style.width =
            health + "%";

    }

    if (ammoText) {

        ammoText.textContent =
            ammo +
            " / " +
            reserveAmmo;

    }

    if (scoreText) {

        scoreText.textContent =
            String(score).padStart(
                4,
                "0"
            );

    }

    if (levelText) {

        levelText.textContent =
            level;

    }

}


/* =========================
   RESIZE
========================= */

function resize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

}


/* =========================
   GAME LOOP
========================= */

function animate() {

    requestAnimationFrame(
        animate
    );

    const dt =
        Math.min(
            clock.getDelta(),
            0.05
        );

    movement(dt);

    updateZombies(dt);

    spawnLogic(dt);

    renderer.render(
        scene,
        camera
    );

}


/* =========================
   START ENGINE
========================= */

init();
