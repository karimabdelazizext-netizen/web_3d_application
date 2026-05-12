// main.js
console.log('3D App Assignment loaded');
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { applyBottleLabel, createHolographicLabel, createMinimalistLabel } from './textureLoader.js';

let scene, camera, renderer, model, light, controls, isRotating = true, ambientLight, fillLight;
let raycaster, mouse;
let currentTextureMode = 0; // 0: original, 1: holographic, 2: minimalist
let textureColorMap = {};
let currentLabelColor = '#1a1a4a'; // Default color for standard bottle

/**
 * Animate camera to a preset viewpoint
 * @param {THREE.Vector3} position - Target camera position
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCameraTo(position, duration = 800) {
    const startPos = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        
        camera.position.x = startPos.x + (position.x - startPos.x) * easeProgress;
        camera.position.y = startPos.y + (position.y - startPos.y) * easeProgress;
        camera.position.z = startPos.z + (position.z - startPos.z) * easeProgress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    animate();
}

function init() {
    scene = new THREE.Scene();
    // Dark background to match the CSS theme — no more light gray fighting the design
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000); // aspect set properly below
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    // Renderer — use the container's actual dimensions, not window dimensions
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Fix camera aspect to match the container, not the full window
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting — much brighter so the model is actually visible
    ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // bright white ambient
    scene.add(ambientLight);

    light = new THREE.DirectionalLight(0xffffff, 1.2); // strong key light
    light.position.set(5, 8, 5);
    scene.add(light);

    fillLight = new THREE.PointLight(0xc9a84c, 2, 50); // gold fill from below for warmth
    fillLight.position.set(-4, -4, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x4488ff, 1); // blue rim from behind
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    // Setup raycasting for click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    loadModel('standard');
    animate(); // called ONCE here, never inside loadModel
}

function animate() {
    requestAnimationFrame(animate);
    if (model && isRotating) {
        model.rotation.y += 0.005;
    }
    if (controls) controls.update();
    renderer.render(scene, camera);
}

window.loadModel = function(modelName) {
    if (model) {
        scene.remove(model);
        model.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        model = null;
    }

    const loader = new GLTFLoader();
    // Path is relative to index.html — models/ folder must sit next to index.html
    const modelPath = `models/${modelName}.glb`;

    loader.load(modelPath, function (gltf) {
        model = gltf.scene;

        // Define product details with label colors
        const productDetails = {
            'standard': {
                name: 'Midnight Mist',
                labelColor: '#1a1a4a' // Deep blue
            },
            'premium': {
                name: 'Golden Amber',
                labelColor: '#d4af37' // Gold
            },
            'luxury': {
                name: 'Azure Bloom',
                labelColor: '#0066cc' // Azure blue
            },
            'standard_one': {
                name: 'Coastal Breeze',
                labelColor: '#2e8b9e' // Teal
            },
            'good_bottle1': {
                name: 'Urban Noir',
                labelColor: '#1a1a1a' // Black
            },
            'second_bottle': {
                name: 'Rose Garden',
                labelColor: '#c41e3a' // Deep red
            }
        };

        const details = productDetails[modelName] || {
            name: modelName,
            labelColor: '#333333'
        };

        // Apply UV-mapped texture labels to the bottle
        applyBottleLabel(model, details.name, details.labelColor);

        // Store color info for texture cycling
        textureColorMap.productName = details.name;
        textureColorMap.labelColor = details.labelColor;
        currentLabelColor = details.labelColor; // Update current color
        document.getElementById('labelColorPicker').value = details.labelColor; // Update color picker UI
        currentTextureMode = 0;

        // Auto-center
        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // cleanest way to center

        // Auto-scale so any size model fills the view nicely
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) model.scale.setScalar(4 / maxDim);

        scene.add(model);
        console.log('Model loaded:', modelName);
        updateUI(modelName);
    }, undefined, function (error) {
        console.error('Error loading model:', modelName, error);
    });
};

function updateUI(id) {
    const data = {
        'standard': {
            title: 'Midnight Mist (Square)',
            desc:  'A bold, architectural scent with notes of cold slate and cedarwood. Ideal for evening wear.'
        },
        'premium': {
            title: 'Golden Amber (Cylinder)',
            desc:  'A warm, classic fragrance featuring honeyed resins and sun-drenched citrus notes.'
        },
        'luxury': {
            title: 'Azure Bloom (Sphere)',
            desc:  'An avant-garde, organic scent inspired by coastal flora and crisp sea salt.'
        }
    };
    const product = data[id] || data['standard'];
    document.getElementById('product-title').innerText = product.title;
    document.getElementById('product-desc').innerText  = product.desc;
}

window.addEventListener('resize', () => {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

init();

document.getElementById('wireframeToggle').addEventListener('change', (e) => {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh) child.material.wireframe = e.target.checked;
        });
    }
});

document.getElementById('lightToggle').addEventListener('change', (e) => {
    [light, ambientLight, fillLight].forEach(l => { if (l) l.visible = e.target.checked; });
});

document.getElementById('rotateBtn').addEventListener('click', () => {
    isRotating = !isRotating;
    document.getElementById('rotateBtn').innerText = isRotating ? 'Pause Rotation' : 'Resume Rotation';
});

// Click on bottle to cycle through texture styles
renderer.domElement.addEventListener('click', (event) => {
    if (!model) return;

    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster with camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with model meshes
    const meshes = [];
    model.traverse((child) => {
        if (child.isMesh) meshes.push(child);
    });

    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
        // Bottle was clicked - cycle texture mode
        currentTextureMode = (currentTextureMode + 1) % 3;
        
        const productName = textureColorMap.productName;
        const labelColor = textureColorMap.labelColor;

        let newTexture;
        let modeLabel = '';

        if (currentTextureMode === 0) {
            // Original label
            applyBottleLabel(model, productName, labelColor);
            modeLabel = '📌 Original Label';
        } else if (currentTextureMode === 1) {
            // Holographic - use label color and a shifted variant
            const shiftedColor = shiftHue(labelColor, 60);
            newTexture = createHolographicLabel(productName, labelColor, shiftedColor);
            modeLabel = '✨ Holographic Edition';
        } else {
            // Minimalist
            newTexture = createMinimalistLabel(productName, labelColor);
            modeLabel = '⚪ Minimalist Design';
        }

        // Apply new texture to all meshes (except mode 0 which re-applies original)
        if (currentTextureMode !== 0) {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = newTexture;
                    child.material.needsUpdate = true;
                }
            });
        }

        // Show feedback to user
        showTextureNotification(modeLabel);
        console.log('Texture mode:', modeLabel);
    }
});

/**
 * Simple hue shift for a hex color
 * @param {string} hex - Hex color code
 * @param {number} degrees - Hue shift in degrees (0-360)
 * @returns {string}
 */
function shiftHue(hex, degrees) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    
    // Simple brightening for now
    const brightR = Math.min(255, r + 30);
    const brightG = Math.min(255, g + 30);
    const brightB = Math.min(255, b + 30);
    
    return '#' + [brightR, brightG, brightB].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Show temporary notification when texture changes
 * @param {string} message - Notification message
 */
function showTextureNotification(message) {
    let notification = document.getElementById('textureNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'textureNotification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: #0ff;
            padding: 12px 20px;
            border-radius: 5px;
            border: 1px solid #0ff;
            font-family: monospace;
            font-size: 14px;
            z-index: 1000;
        `;
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.style.opacity = '1';
    
    if (notification.timeoutId) clearTimeout(notification.timeoutId);
    notification.timeoutId = setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
    }, 2000);
}

document.getElementById('ingredientsBtn').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('ingredientsModal'));
    modal.show();
});

// ============================================
// TEXTURE MODE BUTTONS
// ============================================
document.getElementById('textureBtn0').addEventListener('click', () => {
    currentTextureMode = 0;
    if (model) {
        applyBottleLabel(model, textureColorMap.productName, currentLabelColor);
        showTextureNotification('📌 Original Label');
    }
});

document.getElementById('textureBtn1').addEventListener('click', () => {
    currentTextureMode = 1;
    if (model) {
        const shiftedColor = shiftHue(currentLabelColor, 60);
        const holoTexture = createHolographicLabel(textureColorMap.productName, currentLabelColor, shiftedColor);
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.map = holoTexture;
                child.material.needsUpdate = true;
            }
        });
        showTextureNotification('✨ Holographic Edition');
    }
});

document.getElementById('textureBtn2').addEventListener('click', () => {
    currentTextureMode = 2;
    if (model) {
        const minimalTexture = createMinimalistLabel(textureColorMap.productName, currentLabelColor);
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.map = minimalTexture;
                child.material.needsUpdate = true;
            }
        });
        showTextureNotification('⚪ Minimalist Design');
    }
});

// ============================================
// COLOR PICKER
// ============================================
const colorPicker = document.getElementById('labelColorPicker');
colorPicker.addEventListener('change', (e) => {
    currentLabelColor = e.target.value;
    if (model) {
        // Reapply texture with new color based on current mode
        if (currentTextureMode === 0) {
            applyBottleLabel(model, textureColorMap.productName, currentLabelColor);
        } else if (currentTextureMode === 1) {
            const shiftedColor = shiftHue(currentLabelColor, 60);
            const holoTexture = createHolographicLabel(textureColorMap.productName, currentLabelColor, shiftedColor);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = holoTexture;
                    child.material.needsUpdate = true;
                }
            });
        } else {
            const minimalTexture = createMinimalistLabel(textureColorMap.productName, currentLabelColor);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = minimalTexture;
                    child.material.needsUpdate = true;
                }
            });
        }
        showTextureNotification(`Color updated: ${currentLabelColor}`);
    }
});

// ============================================
// CAMERA PRESET BUTTONS
// ============================================
document.getElementById('camFront').addEventListener('click', () => {
    animateCameraTo(new THREE.Vector3(0, 2, 8));
    showTextureNotification('📷 Front View');
});

document.getElementById('camSide').addEventListener('click', () => {
    animateCameraTo(new THREE.Vector3(8, 2, 0));
    showTextureNotification('📷 Side View');
});

document.getElementById('camTop').addEventListener('click', () => {
    animateCameraTo(new THREE.Vector3(0, 8, 0.1));
    showTextureNotification('📷 Top View');
});

document.getElementById('cam45').addEventListener('click', () => {
    animateCameraTo(new THREE.Vector3(6, 5, 6));
    showTextureNotification('📷 Isometric View');
});
