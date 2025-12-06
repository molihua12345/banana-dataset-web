const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dataset_web', express.static(path.join(__dirname, 'dataset_web')));

// Get image file mapping (id -> extension)
app.get('/api/images', (req, res) => {
    const imagesDir = path.join(__dirname, 'dataset_web', 'images');
    fs.readdir(imagesDir, (err, files) => {
        if (err) return res.status(500).json({ error: err.message });
        const imageMap = {};
        files.forEach(file => {
            const match = file.match(/^(\d+)\.(jpeg|jpg|png|webp)$/i);
            if (match) imageMap[match[1]] = file;
        });
        res.json(imageMap);
    });
});

// Get raw_data JSON
app.get('/api/raw_data/:id', (req, res) => {
    const filePath = path.join(__dirname, 'dataset_web', 'raw_data', `${req.params.id}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).json({ error: 'File not found' });
        res.json(JSON.parse(data));
    });
});

// Get updated_data JSON
app.get('/api/updated_data/:id', (req, res) => {
    const filePath = path.join(__dirname, 'dataset_web', 'updated_data', `${req.params.id}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).json({ error: 'File not found' });
        res.json(JSON.parse(data));
    });
});

// Save updated_data JSON
app.post('/api/updated_data/:id', (req, res) => {
    const filePath = path.join(__dirname, 'dataset_web', 'updated_data', `${req.params.id}.json`);
    fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
