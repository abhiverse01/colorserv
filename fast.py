import cv2
import numpy as np
import os
import json
import logging
import time
import random
import multiprocessing

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
    
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        logging.error(f"Failed to open video file: {video_path}")
        return None

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_indices = get_random_frame_indices(total_frames, 3)  # Choose 3 random frames

    white_frame_count = 0

    for frame_index in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        ret, frame = cap.read()

        if not ret or frame is None:
            logging.error(f"Failed to read frame at index {frame_index} in video: {video_path}")
            continue

        # Resize the frame to reduce processing time
        small_frame = cv2.resize(frame, (frame.shape[1] // 2, frame.shape[0] // 2))
        height, width, _ = small_frame.shape
        upper_part = small_frame[0:height//10, 0:width]

        # Convert to grayscale
        gray = cv2.cvtColor(upper_part, cv2.COLOR_BGR2GRAY)

        # Thresholding to get binary image
        binary = cv2.inRange(gray, 240, 255)

        # Calculate the proportion of white pixels
        white_pixels = np.sum(binary == 255)
        total_pixels = binary.size
        white_ratio = white_pixels / total_pixels

        # Check if white background is dominant in this frame
        if white_ratio > 0.9:
            white_frame_count += 1

        # Early exit if majority is reached
        if white_frame_count >= 2:
            break

    cap.release()

    processing_time = time.time() - start_time
    logging.info(f"Processed {video_path} in {processing_time:.2f} seconds")

    return white_frame_count >= 2

def process_video(video_file):
    video_path = os.path.join('temp', video_file)
    return video_file, check_white_background(video_path)

def main():
    folder_path = 'temp'
    with multiprocessing.Pool() as pool:
        results_list = pool.map(process_video, [f for f in os.listdir(folder_path) if f.endswith('.mp4')])
    results = dict(results_list)

    with open('output.json', 'w') as json_file:
        json.dump(results, json_file, indent=4)
        logging.info(f"Results saved to output.json")

    print("Results saved to output.json")

if __name__ == "__main__":
    main()
