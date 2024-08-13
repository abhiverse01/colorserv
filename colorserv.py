import cv2
import numpy as np
import os
import json
import logging
import time

# Configure logging
logging.basicConfig(
    filename='video_processing.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def check_white_background(video_path):
    start_time = time.time()
    
    # Load the video
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        logging.error(f"Failed to open video file: {video_path}")
        return None

    # Read the first frame
    ret, frame = cap.read()

    if ret:
        # Define ROI for the upper part (e.g., upper 1/10rd of the frame)
        height, width, _ = frame.shape
        upper_part = frame[0:height//10, 0:width]

        # Convert to grayscale
        gray = cv2.cvtColor(upper_part, cv2.COLOR_BGR2GRAY)

        # Thresholding to get binary image
        _, binary = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)

        # Calculate the proportion of white pixels
        white_pixels = np.sum(binary == 255)
        total_pixels = binary.size
        white_ratio = white_pixels / total_pixels

        # Check if white background is dominant
        white_background = bool(white_ratio > 0.9)  # Convert to Python bool
    else:
        logging.error(f"Failed to read the first frame of video: {video_path}")
        white_background = None

    cap.release()

    # Log the processing time
    processing_time = time.time() - start_time
    logging.info(f"Processed {video_path} in {processing_time:.2f} seconds")

    return white_background

def main():
    folder_path = 'temp'
    results = {}

    for video_file in os.listdir(folder_path):
        if video_file.endswith('.mp4'):
            video_path = os.path.join(folder_path, video_file)
            white_background = check_white_background(video_path)
            results[video_file] = white_background

    # Convert NumPy boolean values to Python booleans before dumping to JSON
    results = {k: bool(v) if isinstance(v, np.bool_) else v for k, v in results.items()}

    # Output results as JSON
    with open('output.json', 'w') as json_file:
        json.dump(results, json_file, indent=4)
        logging.info(f"Results saved to output.json")

    print("Results saved to output.json")

if __name__ == "__main__":
    main()
