import cv2
import numpy as np
import os
import json
import logging
import time
import random

# Configure logging
logging.basicConfig(
    filename='video_processing.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def get_random_frame_indices(total_frames, num_samples):
    return sorted(random.sample(range(total_frames), num_samples))

def check_white_background(video_path):
    start_time = time.time()
    
    # Load the video
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        logging.error(f"Failed to open video file: {video_path}")
        return None

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_indices = get_random_frame_indices(total_frames, 5)  # Choose 5 random frames

    white_frame_count = 0

    for frame_index in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        ret, frame = cap.read()

        if not ret or frame is None:
            logging.error(f"Failed to read frame at index {frame_index} in video: {video_path}")
            continue

        # Define ROI for the upper part (e.g., upper 1/10th of the frame)
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

        # Check if white background is dominant in this frame
        if white_ratio > 0.9:
            white_frame_count += 1

    cap.release()

    # Log the processing time
    processing_time = time.time() - start_time
    logging.info(f"Processed {video_path} in {processing_time:.2f} seconds")

    # Return True if the majority of frames are white
    return white_frame_count >= 3  # Majority rule

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
