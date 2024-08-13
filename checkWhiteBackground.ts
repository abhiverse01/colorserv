import * as cv from 'opencv4nodejs-prebuilt-install';
import * as path from 'path';
import * as fs from 'fs';
import * as winston from 'winston';

// Set up logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} - ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'output.log' }),
        new winston.transports.Console()
    ],
});

// Get random frame indices (utility function)
function getRandomFrameIndices(totalFrames: number, numSamples: number): number[] {
    const indices = Array.from({ length: totalFrames }, (_, i) => i);
    const shuffled = indices.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numSamples).sort((a, b) => a - b);
}

// Main function to check white background
export async function checkWhiteBackground(videoPath: string): Promise<boolean | null> {
    try {
        const cap = new cv.VideoCapture(videoPath);

        if (!cap) {
            logger.error("Failed to open video.");
            return null; // Failed to open video
        }

        const firstFrame = cap.read();
        if (firstFrame.empty) {
            logger.error("Failed to read the first frame.");
            return null; // Failed to read the first frame
        }

        const totalFrames = cap.get(cv.CAP_PROP_FRAME_COUNT);
        const frameIndices = getRandomFrameIndices(totalFrames, 3); // 3 random frames

        let whiteFrameCount = 0;

        for (const frameIndex of frameIndices) {
            cap.set(cv.CAP_PROP_POS_FRAMES, frameIndex);
            const frame = cap.read();

            if (frame.empty) {
                continue; // Skip if the frame cannot be read
            }

            // Resize the frame to reduce processing time
            const smallFrame = frame.resize(Math.floor(frame.rows / 2), Math.floor(frame.cols / 2));
            const height = smallFrame.rows;
            const width = smallFrame.cols;
            const upperPart = smallFrame.getRegion(new cv.Rect(0, 0, width, Math.floor(height / 10))); // 1/10th of the frame is the region of interest.

            // Convert to grayscale
            const gray = upperPart.cvtColor(cv.COLOR_BGR2GRAY);

            // Thresholding to get binary image
            const binary = gray.inRange(240, 255);

            // Calculate the proportion of white pixels
            const whitePixels = binary.countNonZero();
            const totalPixels = binary.rows * binary.cols;
            const whiteRatio = whitePixels / totalPixels;

            // Check if white background is dominant in this frame
            if (whiteRatio > 0.9) {
                whiteFrameCount += 1;
            }

            // Early exit if majority is reached
            if (whiteFrameCount >= 2) {
                break;
            }
        }

        cap.release();

        const result = whiteFrameCount >= 2;

        logger.info(`Processed video ${videoPath}. Dominant white background: ${result}`);

        return result;

    } catch (error) {
        logger.error(`Error processing video: ${error.message}`);
        return null;
    }
}

// Standalone testing function
async function main() {
    // Correctly resolve the path to the 'temp' directory within your project
    const tempDir = path.resolve(__dirname, 'temp');
    
    // Ensure that you are accessing the correct 'temp' directory
    const files = fs.readdirSync(tempDir).filter(file => file.endsWith('.mp4'));
    
    // Define the type of the results array
    const results: { video: string; whiteBackground: boolean }[] = [];

    for (const file of files) {
        const videoPath = path.join(tempDir, file);
        const result = await checkWhiteBackground(videoPath);
        
        if (result === null) {
            logger.error(`The video ${file} could not be processed.`);
        } else {
            results.push({ video: file, whiteBackground: result });
        }
    }

    // Save all results to output.json
    fs.writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(results, null, 4));
    logger.info("All results saved to output.json");

    console.log("Processing complete. Check output.json and output.log for details.");
}


// Run the standalone test
main();
