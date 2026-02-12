const http = require('http');

// One of the failing images
const imagePath = '/uploads/upload-1770846388059-664507295.png';
const url = `http://localhost:3000${imagePath}`;

console.log(`Fetching ${url}...`);

http.get(url, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = [];
    res.on('data', chunk => data.push(chunk));
    res.on('end', () => {
        const buffer = Buffer.concat(data);
        console.log('Total bytes received:', buffer.length);
        if (buffer.length > 0) {
            console.log('First 20 bytes (hex):', buffer.slice(0, 20).toString('hex'));
            console.log('First 20 bytes (utf8):', buffer.slice(0, 20).toString('utf8'));
        }
    });
}).on('error', (e) => {
    console.error('Error fetching image:', e);
});
