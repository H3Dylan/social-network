import Image from 'next/image';

export default function ImageTest() {
    const testUrl = '/uploads/upload-1770648277601-823861079.jpg'; // Filename from previous step

    return (
        <div style={{ padding: 50 }}>
            <h1>Image Test</h1>
            <h2>Standard img tag</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={testUrl} alt="Standard HTML img" width="300" />

            <h2>Next Image</h2>
            <div style={{ position: 'relative', width: 300, height: 200 }}>
                <Image src={testUrl} alt="Next Image" fill style={{ objectFit: 'contain' }} />
            </div>
        </div>
    );
}
