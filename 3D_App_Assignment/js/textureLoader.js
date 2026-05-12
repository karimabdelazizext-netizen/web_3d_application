// textureLoader.js - Generate UV-mapped bottle labels dynamically
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

/**
 * Create a canvas texture for bottle labels
 * @param {string} productName - Name of the product
 * @param {string} primaryColor - Hex color for the label
 * @returns {THREE.CanvasTexture}
 */
export function createBottleLabel(productName, primaryColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Product name (large text)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(productName, canvas.width / 2, canvas.height / 2 - 80);

    // Decorative line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, canvas.height / 2 - 20);
    ctx.lineTo(canvas.width - 80, canvas.height / 2 - 20);
    ctx.stroke();

    // Description text
    ctx.fillStyle = '#cccccc';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('PREMIUM FRAGRANCE', canvas.width / 2, canvas.height / 2 + 40);

    // Bottom branding
    ctx.fillStyle = '#999999';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('EST. 2024', canvas.width / 2, canvas.height - 50);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

/**
 * Apply UV-mapped label texture to a model's meshes
 * @param {THREE.Object3D} model - The loaded model
 * @param {string} productName - Name of the product
 * @param {string} labelColor - Hex color for the label
 */
export function applyBottleLabel(model, productName, labelColor) {
    const labelTexture = createBottleLabel(productName, labelColor);

    model.traverse((child) => {
        if (child.isMesh) {
            // Check if mesh has UV coordinates (most bottle models should)
            if (child.geometry.attributes.uv) {
                // Create a combined material with texture and metallic properties
                child.material = new THREE.MeshStandardMaterial({
                    map: labelTexture,  // Apply the label as the color map
                    roughness: 0.1,
                    metalness: 0.2,
                    transparent: true,
                    opacity: 0.95,
                });
            } else {
                console.warn('Mesh lacks UV coordinates:', child.name);
                // Fallback to solid color if no UV
                child.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(labelColor),
                    roughness: 0.1,
                    metalness: 0.2,
                });
            }
        }
    });
}

/**
 * Generate a holographic/gradient texture variation
 * @param {string} productName - Name of the product
 * @param {string} color1 - First gradient color
 * @param {string} color2 - Second gradient color
 * @returns {THREE.CanvasTexture}
 */
export function createHolographicLabel(productName, color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Diagonal gradient for holographic effect
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Metallic accent border
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 6;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    // Product name with shadow effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = 'bold 52px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(productName, canvas.width / 2 + 2, canvas.height / 2 - 78);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(productName, canvas.width / 2, canvas.height / 2 - 80);

    // Decorative elements
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, canvas.height / 2 - 20);
    ctx.lineTo(canvas.width - 60, canvas.height / 2 - 20);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('LIMITED EDITION', canvas.width / 2, canvas.height / 2 + 50);

    ctx.fillStyle = '#cccc00';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('HOLOGRAPHIC', canvas.width / 2, canvas.height - 40);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

/**
 * Generate a minimalist monochrome label
 * @param {string} productName - Name of the product
 * @param {string} textColor - Text color
 * @returns {THREE.CanvasTexture}
 */
export function createMinimalistLabel(productName, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle border
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Product name - minimalist style
    ctx.fillStyle = textColor;
    ctx.font = 'bold 56px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(productName, canvas.width / 2, canvas.height / 2 - 60);

    // Simple line separator
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, canvas.height / 2 + 20);
    ctx.lineTo(canvas.width - 100, canvas.height / 2 + 20);
    ctx.stroke();

    // Subtle tagline
    ctx.fillStyle = textColor;
    ctx.font = '12px Georgia, serif';
    ctx.fillText('PURE ELEGANCE', canvas.width / 2, canvas.height / 2 + 80);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}
