let imageMap = {};
let currentId = 0;
let originalData = '';
let scale = 1;
let translateX = 0, translateY = 0;
let isDragging = false;
let startX, startY;

// Initialize
async function init() {
    const res = await fetch('/api/images');
    imageMap = await res.json();
    const ids = Object.keys(imageMap).map(Number).sort((a, b) => a - b);
    
    const sidebar = document.getElementById('sidebar');
    ids.forEach(id => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.textContent = id;
        item.dataset.id = id;
        item.onclick = () => selectItem(id);
        sidebar.appendChild(item);
    });
    
    if (ids.length > 0) selectItem(ids[0]);
    setupImageDrag();
}

// Select item
async function selectItem(id) {
    if (currentId === id) return;
    currentId = id;
    
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id == id);
    });
    
    // Reset zoom
    resetZoom();
    
    // Load image
    const img = document.getElementById('image');
    img.src = `/dataset_web/images/${imageMap[id]}`;
    
    // Load raw data
    const rawPre = document.getElementById('rawData');
    rawPre.textContent = 'Loading...';
    try {
        const rawRes = await fetch(`/api/raw_data/${id}`);
        const rawJson = await rawRes.json();
        rawPre.textContent = JSON.stringify(rawJson, null, 2);
    } catch (e) {
        rawPre.textContent = 'Error loading data';
    }
    
    // Load updated data
    const textarea = document.getElementById('updatedData');
    textarea.value = 'Loading...';
    try {
        const updRes = await fetch(`/api/updated_data/${id}`);
        const updJson = await updRes.json();
        const text = JSON.stringify(updJson, null, 2);
        textarea.value = text;
        originalData = text;
    } catch (e) {
        textarea.value = 'Error loading data';
    }
    
    setStatus('');
}

// Save data
async function saveData() {
    const textarea = document.getElementById('updatedData');
    const btn = document.getElementById('saveBtn');
    
    let json;
    try {
        json = JSON.parse(textarea.value);
    } catch (e) {
        setStatus('Invalid JSON: ' + e.message, 'error');
        return;
    }
    
    btn.disabled = true;
    try {
        const res = await fetch(`/api/updated_data/${currentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        });
        if (res.ok) {
            originalData = textarea.value;
            setStatus('Saved successfully!', 'success');
        } else {
            setStatus('Save failed', 'error');
        }
    } catch (e) {
        setStatus('Save error: ' + e.message, 'error');
    }
    btn.disabled = false;
}

// Reset data
function resetData() {
    document.getElementById('updatedData').value = originalData;
    setStatus('Reset to last saved', 'success');
}

// Status
function setStatus(msg, type = '') {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status ' + type;
    if (msg) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3000);
}

// Zoom functions
function zoomIn() { scale = Math.min(scale * 1.2, 5); updateTransform(); }
function zoomOut() { scale = Math.max(scale / 1.2, 0.2); updateTransform(); }
function resetZoom() { scale = 1; translateX = 0; translateY = 0; updateTransform(); }
function updateTransform() {
    document.getElementById('image').style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// Image drag
function setupImageDrag() {
    const container = document.getElementById('imageContainer');
    const img = document.getElementById('image');
    
    img.addEventListener('mousedown', e => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            e.preventDefault();
        }
    });
    
    document.addEventListener('mousemove', e => {
        if (isDragging) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });
    
    document.addEventListener('mouseup', () => isDragging = false);
    
    container.addEventListener('wheel', e => {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveData();
    }
});

init();
