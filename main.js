// Data Disk Visualization using Three.js - Simple Version
console.log('Starting Data Disk Visualization...');

// Check if Three.js is loaded
if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded!');
    document.querySelector('.loading').textContent = 'Error: Three.js failed to load';
} else {
    console.log('Three.js is available');
}

function initVisualization() {
    console.log('Initializing visualization...');
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa); // Light gray background
    console.log('Scene created');
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    console.log('Camera created');
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    console.log('Renderer created');

    // Add renderer to DOM
    const appElement = document.getElementById('app');
    appElement.innerHTML = '';
    appElement.appendChild(renderer.domElement);
    console.log('Canvas added to DOM');

    // Lighting - adjusted for light background
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(0, 10, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Add directional light for better illumination
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    console.log('Lights added');

    // Central DATA sphere - adjusted for light background
    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6b6b,
        emissive: 0x441111,
        shininess: 100
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0, 0);
    sphere.castShadow = true;
    scene.add(sphere);
    console.log('Central sphere added');
    
    // Add enhanced glow effect for light background
    const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    console.log('Glow effect added');

    // Create disk sectors using RingGeometry
    const sectors = [
        { color: 0x4A90E2, label: 'TEXT', startAngle: 0, endAngle: Math.PI * 2/3 },
        { color: 0x7ED321, label: 'AUDIO', startAngle: Math.PI * 2/3, endAngle: Math.PI * 4/3 },
        { color: 0xF5A623, label: 'IMAGE', startAngle: Math.PI * 4/3, endAngle: Math.PI * 2 }
    ];

    // Store sector meshes for interaction
    const sectorMeshes = [];
    const subArcMeshes = [];
    const techniqueWedges = [];
    
    // Track expanded sub-arcs
    const expandedSubArcs = new Set();

    sectors.forEach((sectorData, index) => {
        const ringGeometry = new THREE.RingGeometry(1.5, 3.5, 8, 1, sectorData.startAngle, sectorData.endAngle - sectorData.startAngle);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: sectorData.color,
            emissive: new THREE.Color(sectorData.color).multiplyScalar(0.3), // Add glowing effect
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            shininess: 100
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 4; // Rotate to be more upright
        ring.receiveShadow = true;
        ring.userData = { type: 'main', sector: sectorData.label, index: index };
        scene.add(ring);
        sectorMeshes.push(ring);

        // Create black outline for the sector
        const outlineGeometry = new THREE.RingGeometry(1.5, 3.5, 8, 1, sectorData.startAngle, sectorData.endAngle - sectorData.startAngle);
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            wireframe: true
        });
        
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.rotation.x = -Math.PI / 4;
        outline.position.y = 0.01; // Slightly above the main sector
        scene.add(outline);
        
        console.log(`Sector ${index + 1} (${sectorData.label}) added with glow and outline`);
    });

    // Create sub-arcs for each main sector
    const subArcs = [
        // Text sector sub-arcs
        { parent: 'TEXT', from: 'Text', to: 'Text', color: 0x1e3a8a, startAngle: 0, endAngle: Math.PI * 2/9 },
        { parent: 'TEXT', from: 'Text', to: 'Audio', color: 0x0d9488, startAngle: Math.PI * 2/9, endAngle: Math.PI * 4/9 },
        { parent: 'TEXT', from: 'Text', to: 'Image', color: 0xd4af37, startAngle: Math.PI * 4/9, endAngle: Math.PI * 6/9 },
        
        // Audio sector sub-arcs
        { parent: 'AUDIO', from: 'Audio', to: 'Audio', color: 0x166534, startAngle: Math.PI * 2/3, endAngle: Math.PI * 2/3 + Math.PI * 2/9 },
        { parent: 'AUDIO', from: 'Audio', to: 'Image', color: 0x9a3412, startAngle: Math.PI * 2/3 + Math.PI * 2/9, endAngle: Math.PI * 2/3 + Math.PI * 4/9 },
        { parent: 'AUDIO', from: 'Audio', to: 'Text', color: 0x0891b2, startAngle: Math.PI * 2/3 + Math.PI * 4/9, endAngle: Math.PI * 4/3 },
        
        // Image sector sub-arcs
        { parent: 'IMAGE', from: 'Image', to: 'Image', color: 0xea580c, startAngle: Math.PI * 4/3, endAngle: Math.PI * 4/3 + Math.PI * 2/9 },
        { parent: 'IMAGE', from: 'Image', to: 'Text', color: 0x7c3aed, startAngle: Math.PI * 4/3 + Math.PI * 2/9, endAngle: Math.PI * 4/3 + Math.PI * 4/9 },
        { parent: 'IMAGE', from: 'Image', to: 'Audio', color: 0x65a30d, startAngle: Math.PI * 4/3 + Math.PI * 4/9, endAngle: Math.PI * 2 }
    ];

    subArcs.forEach((subArcData, index) => {
        const ringGeometry = new THREE.RingGeometry(3.8, 5.2, 6, 1, subArcData.startAngle, subArcData.endAngle - subArcData.startAngle);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: subArcData.color,
            emissive: new THREE.Color(subArcData.color).multiplyScalar(0.2), // Add glowing effect
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            shininess: 80
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 4; // Rotate to be more upright
        ring.receiveShadow = true;
        ring.userData = { 
            type: 'sub', 
            parent: subArcData.parent, 
            from: subArcData.from, 
            to: subArcData.to, 
            index: index,
            originalColor: subArcData.color,
            originalOpacity: 0.8
        };
        scene.add(ring);
        subArcMeshes.push(ring);

        // Create black outline for the sub-arc
        const outlineGeometry = new THREE.RingGeometry(3.8, 5.2, 6, 1, subArcData.startAngle, subArcData.endAngle - subArcData.startAngle);
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            wireframe: true
        });
        
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.rotation.x = -Math.PI / 4;
        outline.position.y = 0.01; // Slightly above the main sub-arc
        scene.add(outline);
        
        // Create technique wedges for this sub-arc
        const techniques = [
            'Classical / Rule-based',
            'Statistical & Hybrid',
            'Deep Learning',
            'Advanced / Emerging'
        ];

        const subArcAngleRange = subArcData.endAngle - subArcData.startAngle;
        const techniqueAngleStep = subArcAngleRange / 4;

        techniques.forEach((technique, techIndex) => {
            const techStartAngle = subArcData.startAngle + techIndex * techniqueAngleStep;
            const techEndAngle = techStartAngle + techniqueAngleStep;
            
            // Create slightly lighter/darker shade
            const baseColor = new THREE.Color(subArcData.color);
            const shadeFactor = 0.8 + (techIndex * 0.1); // Vary shades
            const techniqueColor = baseColor.clone().multiplyScalar(shadeFactor);
            
            const techGeometry = new THREE.RingGeometry(5.5, 6.5, 4, 1, techStartAngle, techniqueAngleStep);
            const techMaterial = new THREE.MeshPhongMaterial({
                color: techniqueColor,
                emissive: techniqueColor.clone().multiplyScalar(0.15), // Add glowing effect
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
                shininess: 60
            });
            
            const techWedge = new THREE.Mesh(techGeometry, techMaterial);
            techWedge.rotation.x = -Math.PI / 4;
            techWedge.receiveShadow = true;
            techWedge.userData = {
                type: 'technique',
                parent: subArcData.parent,
                from: subArcData.from,
                to: subArcData.to,
                technique: technique,
                index: techIndex,
                originalColor: techniqueColor,
                originalOpacity: 0.7,
                originalPosition: techWedge.position.clone(),
                subArcIndex: index // Reference to parent sub-arc
            };
            
            scene.add(techWedge);
            techniqueWedges.push(techWedge);

            // Create black outline for the technique wedge
            const techOutlineGeometry = new THREE.RingGeometry(5.5, 6.5, 4, 1, techStartAngle, techniqueAngleStep);
            const techOutlineMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
                wireframe: true
            });
            
            const techOutline = new THREE.Mesh(techOutlineGeometry, techOutlineMaterial);
            techOutline.rotation.x = -Math.PI / 4;
            techOutline.position.y = 0.01; // Slightly above the main wedge
            scene.add(techOutline);
        });
        
        console.log(`Sub-arc ${index + 1} (${subArcData.from}→${subArcData.to}) and 4 technique wedges added`);
    });

    // Create text labels using canvas
    function createTextLabel(text, position, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = color;
        context.font = 'Bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const geometry = new THREE.PlaneGeometry(1.5, 0.75);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        return mesh;
    }

    // Add labels - dark colors for light background
    const labels = [
        { text: 'TEXT', position: new THREE.Vector3(2.5 * Math.cos(Math.PI / 3), 1.2, 2.5 * Math.sin(Math.PI / 3)), color: '#1e40af' },
        { text: 'AUDIO', position: new THREE.Vector3(2.5 * Math.cos(Math.PI), 1.2, 2.5 * Math.sin(Math.PI)), color: '#166534' },
        { text: 'IMAGE', position: new THREE.Vector3(2.5 * Math.cos(Math.PI * 5/3), 1.2, 2.5 * Math.sin(Math.PI * 5/3)), color: '#ea580c' },
        { text: 'DATA', position: new THREE.Vector3(0, 1.5, 0), color: '#dc2626' }
    ];

    // Add sub-arc labels - dark colors for light background
    const subArcLabels = [
        { text: 'T→T', position: new THREE.Vector3(4.5 * Math.cos(Math.PI / 9), 1.2, 4.5 * Math.sin(Math.PI / 9)), color: '#1e3a8a' },
        { text: 'T→A', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 3/9), 1.2, 4.5 * Math.sin(Math.PI * 3/9)), color: '#0d9488' },
        { text: 'T→I', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 5/9), 1.2, 4.5 * Math.sin(Math.PI * 5/9)), color: '#d97706' },
        
        { text: 'A→A', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 2/3 + Math.PI / 9), 1.2, 4.5 * Math.sin(Math.PI * 2/3 + Math.PI / 9)), color: '#166534' },
        { text: 'A→I', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 2/3 + Math.PI * 3/9), 1.2, 4.5 * Math.sin(Math.PI * 2/3 + Math.PI * 3/9)), color: '#9a3412' },
        { text: 'A→T', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 2/3 + Math.PI * 5/9), 1.2, 4.5 * Math.sin(Math.PI * 2/3 + Math.PI * 5/9)), color: '#0891b2' },
        
        { text: 'I→I', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 4/3 + Math.PI / 9), 1.2, 4.5 * Math.sin(Math.PI * 4/3 + Math.PI / 9)), color: '#ea580c' },
        { text: 'I→T', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 4/3 + Math.PI * 3/9), 1.2, 4.5 * Math.sin(Math.PI * 4/3 + Math.PI * 3/9)), color: '#7c3aed' },
        { text: 'I→A', position: new THREE.Vector3(4.5 * Math.cos(Math.PI * 4/3 + Math.PI * 5/9), 1.2, 4.5 * Math.sin(Math.PI * 4/3 + Math.PI * 5/9)), color: '#65a30d' }
    ];

    const labelMeshes = [];
    [...labels, ...subArcLabels].forEach(labelData => {
        const label = createTextLabel(labelData.text, labelData.position, labelData.color);
        scene.add(label);
        labelMeshes.push(label);
    });
    console.log('Labels added');

    // Raycaster for mouse interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh = null;
    let selectedMesh = null;

    // Mouse event handlers
    function onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects([...sectorMeshes, ...subArcMeshes, ...techniqueWedges]);

        // Reset previous hover
        if (hoveredMesh) {
            resetMeshHighlight(hoveredMesh);
            hideTooltip();
            hoveredMesh = null;
        }

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            hoveredMesh = intersectedMesh;
            highlightMesh(intersectedMesh);
            
            // Show tooltip based on mesh type
            let tooltipText = '';
            if (intersectedMesh.userData.type === 'main') {
                tooltipText = intersectedMesh.userData.sector;
            } else if (intersectedMesh.userData.type === 'sub') {
                tooltipText = `${intersectedMesh.userData.from}→${intersectedMesh.userData.to}`;
            } else if (intersectedMesh.userData.type === 'technique') {
                tooltipText = intersectedMesh.userData.technique;
            }
            
            if (tooltipText) {
                showTooltip(tooltipText, event.clientX, event.clientY);
            }
        }
    }

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([...sectorMeshes, ...subArcMeshes, ...techniqueWedges]);

        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            console.log('Clicked:', clickedMesh.userData);
            
            // Handle sub-arc clicks for expansion/collapse
            if (clickedMesh.userData.type === 'sub') {
                toggleSubArcExpansion(clickedMesh);
            } else if (clickedMesh.userData.type === 'technique') {
                // Handle technique wedge clicks with GSAP animation
                animateTechniqueWedge(clickedMesh);
            } else {
                // Show transformation info for other elements
                showTransformationInfo(clickedMesh.userData);
            }
        }
    }

    function highlightMesh(mesh) {
        if (mesh.userData.type === 'technique') {
            // Highlight technique wedge
            mesh.material.opacity = 1.0;
            mesh.material.emissive = new THREE.Color(mesh.userData.originalColor).multiplyScalar(0.4);
        } else if (mesh.userData.type === 'sub') {
            // Highlight sub-arc
            mesh.material.opacity = 1.0;
            mesh.material.emissive = new THREE.Color(mesh.userData.originalColor).multiplyScalar(0.3);
            
            // Highlight parent sector
            const parentSector = sectorMeshes.find(s => s.userData.sector === mesh.userData.parent);
            if (parentSector) {
                parentSector.material.opacity = 1.0;
                parentSector.material.emissive = new THREE.Color(parentSector.material.color).multiplyScalar(0.2);
            }
        } else if (mesh.userData.type === 'main') {
            // Highlight main sector
            mesh.material.opacity = 1.0;
            mesh.material.emissive = new THREE.Color(mesh.material.color).multiplyScalar(0.2);
        }
    }

    function resetMeshHighlight(mesh) {
        if (mesh.userData.type === 'technique') {
            mesh.material.opacity = mesh.userData.originalOpacity;
            mesh.material.emissive = new THREE.Color(0x000000);
        } else if (mesh.userData.type === 'sub') {
            mesh.material.opacity = mesh.userData.originalOpacity;
            mesh.material.emissive = new THREE.Color(0x000000);
            
            // Reset parent sector
            const parentSector = sectorMeshes.find(s => s.userData.sector === mesh.userData.parent);
            if (parentSector) {
                parentSector.material.opacity = 0.8;
                parentSector.material.emissive = new THREE.Color(0x000000);
            }
        } else if (mesh.userData.type === 'main') {
            mesh.material.opacity = 0.8;
            mesh.material.emissive = new THREE.Color(0x000000);
        }
    }

    function showTransformationInfo(data) {
        let message = '';
        if (data.type === 'technique') {
            message = `${data.from} → ${data.to}\nTechnique: ${data.technique}`;
        } else if (data.type === 'sub') {
            message = `Transformation: ${data.from} → ${data.to}`;
        } else {
            message = `Main Sector: ${data.sector}`;
        }
        
        // Update info display
        const infoElement = document.getElementById('transformation-info');
        if (infoElement) {
            infoElement.textContent = message;
            infoElement.style.display = 'block';
            setTimeout(() => {
                infoElement.style.display = 'none';
            }, 3000);
        }
        
        console.log(message);
    }

    function showTooltip(text, x, y) {
        const tooltip = document.getElementById('technique-tooltip');
        if (tooltip) {
            tooltip.textContent = text;
            tooltip.style.left = (x + 10) + 'px';
            tooltip.style.top = (y - 10) + 'px';
            tooltip.style.display = 'block';
        }
    }

    function hideTooltip() {
        const tooltip = document.getElementById('technique-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    function animateTechniqueWedge(mesh) {
        if (typeof gsap !== 'undefined') {
            // Animate outward movement
            gsap.to(mesh.position, {
                z: mesh.userData.originalPosition.z + 0.5,
                duration: 0.3,
                ease: "power2.out",
                yoyo: true,
                repeat: 1
            });
            
            // Animate scale
            gsap.to(mesh.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.3,
                ease: "power2.out",
                yoyo: true,
                repeat: 1
            });
            
            // Animate opacity
            gsap.to(mesh.material, {
                opacity: 1.0,
                duration: 0.3,
                ease: "power2.out",
                yoyo: true,
                repeat: 1
            });
        } else {
            console.warn('GSAP not available for animation');
        }
    }

    function toggleSubArcExpansion(subArcMesh) {
        const subArcIndex = subArcMesh.userData.index;
        const isExpanded = expandedSubArcs.has(subArcIndex);
        
        if (isExpanded) {
            // Collapse: move wedges back to original position
            collapseSubArcWedges(subArcIndex);
            expandedSubArcs.delete(subArcIndex);
            console.log(`Collapsed sub-arc ${subArcIndex}`);
        } else {
            // Expand: move wedges outward
            expandSubArcWedges(subArcIndex);
            expandedSubArcs.add(subArcIndex);
            console.log(`Expanded sub-arc ${subArcIndex}`);
        }
    }

    function expandSubArcWedges(subArcIndex) {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not available for expansion animation');
            return;
        }

        // Find all technique wedges for this sub-arc
        const wedgesToExpand = techniqueWedges.filter(wedge => wedge.userData.subArcIndex === subArcIndex);
        
        wedgesToExpand.forEach((wedge, index) => {
            // Calculate expansion distance based on wedge index (outer wedges move further)
            const expansionDistance = 0.8 + (index * 0.3);
            
            gsap.to(wedge.position, {
                z: wedge.userData.originalPosition.z + expansionDistance,
                duration: 0.5,
                ease: "power2.out"
            });
            
            // Also increase opacity slightly
            gsap.to(wedge.material, {
                opacity: 0.8,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }

    function collapseSubArcWedges(subArcIndex) {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not available for collapse animation');
            return;
        }

        // Find all technique wedges for this sub-arc
        const wedgesToCollapse = techniqueWedges.filter(wedge => wedge.userData.subArcIndex === subArcIndex);
        
        wedgesToCollapse.forEach(wedge => {
            gsap.to(wedge.position, {
                z: wedge.userData.originalPosition.z,
                duration: 0.5,
                ease: "power2.out"
            });
            
            // Reset opacity
            gsap.to(wedge.material, {
                opacity: wedge.userData.originalOpacity,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }

    // Add event listeners
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);

    // OrbitControls (with fallback)
    let controls = null;
    try {
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = true;
            controls.enablePan = true;
            console.log('OrbitControls initialized successfully');
        } else {
            console.warn('OrbitControls not available - using manual rotation');
        }
    } catch (error) {
        console.warn('Failed to initialize OrbitControls:', error.message);
        console.log('Falling back to manual rotation');
    }

    // Animation variables
    let time = 0;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.01;
        
        // Animate glow effect
        glowMaterial.opacity = 0.2 + 0.1 * Math.sin(time * 2);
        
        // Rotate the data sphere
        sphere.rotation.y += 0.005;
        glowMesh.rotation.y += 0.005;
        
        // Update controls
        if (controls) {
            controls.update();
        } else {
            // Manual rotation if no controls
            camera.position.x = Math.cos(time * 0.1) * 8;
            camera.position.z = Math.sin(time * 0.1) * 8;
            camera.lookAt(0, 0, 0);
        }
        
        // Update labels to face camera
        labelMeshes.forEach(label => {
            label.lookAt(camera.position);
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    console.log('Animation loop started');

    // Handle window resize
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    window.addEventListener('resize', handleResize);

    // Hide loading message
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    console.log('Visualization initialized successfully!');
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, initializing...');
    
    // Small delay to ensure Three.js is fully loaded
    setTimeout(() => {
        try {
            initVisualization();
        } catch (error) {
            console.error('Error initializing visualization:', error);
            const loadingElement = document.querySelector('.loading');
            if (loadingElement) {
                loadingElement.textContent = 'Error: ' + error.message;
                loadingElement.style.color = '#ff6b6b';
            }
        }
    }, 100);
});