# ColorServ

- This repository contains a Python and TypeScript-based video processing tool that analyzes video files to determine if the top part of the video has a dominant white background. The tool processes videos from a specified directory, checks for the presence of a white background, and outputs the results in a JSON file while logging important details during the execution.

## 📋 Project Overview

The main goal of this tool is to automate the detection of a white background in videos. It uses OpenCV for video processing, with implementations in both Python and Node.js (TypeScript). The Python version processes a single frame to check the top 10% of the frame, while the Node.js version samples random frames for a more robust check.

### Key Features
- **White Background Detection**: Analyze the top region of each video frame to determine if the background is predominantly white.
- **Logging**: Both versions log the execution details and errors to log files (`video_processing.log` in Python, `output.log` in Node.js).
- **Output Results**: The result of the analysis is saved in a `JSON` file (`output.json`), which contains the video file names and whether a dominant white background was detected.
- **Random Frame Sampling (Node.js)**: For more reliable results, the Node.js implementation checks multiple random frames from the video.

## 🛠️ Dependencies

### Python Version:
- **OpenCV** (`cv2`)
- **NumPy**
- **Logging** (standard library)
- **JSON** (standard library)

Install dependencies using:
```bash
pip install opencv-python numpy
```

### Node.js (TypeScript) Version:
- **opencv4nodejs-prebuilt-install**
- **winston** (for logging)
- **fs** (for file system operations)
- **path**

Install dependencies using:
```bash
npm install opencv4nodejs-prebuilt-install winston
```

## 🚀 Usage

### Python Version:
1. Place the video files (`.mp4`) inside the `temp/` folder.
2. Run the Python script:
   ```bash
   python video_processing.py
   ```
3. The results will be saved in `output.json` and the log file `video_processing.log`.

### Node.js (TypeScript) Version:
1. Place the video files (`.mp4`) inside the `temp/` folder.
2. Compile and run the TypeScript script:
   ```bash
   npm run build   # Compiles the TypeScript code
   node dist/video_processing.js
   ```
3. The results will be saved in `output.json` and the log file `output.log`.

## 🔧 How It Works

1. **Frame Extraction**: The tool extracts frames from each video.
   - Python: It analyzes the first frame.
   - Node.js: It samples three random frames.
   
2. **Region of Interest (ROI)**: The upper 10% of each frame is analyzed for white pixels.

3. **Grayscale and Thresholding**: The upper part of the frame is converted to grayscale and thresholded to isolate white pixels.

4. **White Ratio Calculation**: The proportion of white pixels in the region is calculated. If the white pixel ratio exceeds 90%, it is considered a "white background."

5. **Result Logging**: The results are saved in the output log and a JSON file.

## 📄 Output Format

The results are stored in `output.json` in the following format:

```json
{
    "video1.mp4": true,
    "video2.mp4": false,
    "video3.mp4": null  // If processing failed
}
```

- `true`: Dominant white background detected.
- `false`: No dominant white background.
- `null`: Processing failure.

## 📝 Logging

Both Python and Node.js versions log the following information:
- Processing start and end times.
- Errors encountered (e.g., file not found, frame reading failure).
- Processing time for each video.

## 🛠️ Error Handling

The tool logs errors and ensures the processing continues even if one video fails:
- **Python**: If a video fails to load or the first frame cannot be read, the error is logged.
- **Node.js**: If frames cannot be read or processed, the error is logged and the next video is processed.

## 👨‍💻 Contribution

Feel free to contribute by submitting issues, pull requests, or suggestions. Whether it's optimizing code, adding new features, or improving the detection algorithm, all contributions are welcome!

## 📞 Contact

For any questions or feedback, please contact **Abhishek Shah** via GitHub.
