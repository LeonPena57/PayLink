/**
 * Generates a low-resolution, watermarked preview of an image file.
 * @param file The original image file.
 * @returns A Promise that resolves to the watermarked Blob.
 */
export async function generateWatermarkedPreview(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // 1. Resize for preview (max width 800px) to save space and reduce quality
            const MAX_WIDTH = 800;
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // 2. Draw the resized image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 3. Add "PAYLINK PREVIEW" Watermark
            // Diagonal text pattern
            ctx.save();
            ctx.rotate(-Math.PI / 4);
            ctx.font = "bold 48px sans-serif";
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.textAlign = "center";

            // Draw multiple watermarks
            for (let i = -canvas.height; i < canvas.width * 2; i += 200) {
                for (let j = -canvas.width; j < canvas.height * 2; j += 100) {
                    ctx.fillText("PAYLINK PREVIEW", i, j);
                }
            }
            ctx.restore();

            // 4. Add a blur filter or pixelation effect (optional, but requested "distorted")
            // A simple way to distort is to draw a noise overlay or just rely on the watermark + low res.
            // Let's add a heavy noise overlay.
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                // Add random noise
                const noise = (Math.random() - 0.5) * 50;
                data[i] = Math.min(255, Math.max(0, data[i] + noise));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
            ctx.putImageData(imageData, 0, 0);

            // 5. Export as JPEG with lower quality
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Canvas to Blob failed"));
                }
                URL.revokeObjectURL(url);
            }, "image/jpeg", 0.6); // 60% quality
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}
