import cv2
import mediapipe as mp
import numpy as np
import os
import csv
import time

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7, min_tracking_confidence=0.5)

# Setup
DATASET_PATH = 'dataset.csv'
CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'space', 'del', 'nothing']
SAMPLES_PER_CLASS = 100

def initialize_csv():
    if not os.path.exists(DATASET_PATH):
        with open(DATASET_PATH, mode='w', newline='') as f:
            writer = csv.writer(f)
            # Create headers: class_id, x1, y1, z1, x2, y2, z2...
            header = ['class_id']
            for i in range(21):
                header.extend([f'x{i}', f'y{i}', f'z{i}'])
            writer.writerow(header)

def collect_data():
    initialize_csv()
    cap = cv2.VideoCapture(0)

    print("Data Collection Started.")
    print("Press 'q' at any time to quit.")
    
    for class_index, class_name in enumerate(CLASSES):
        print(f"\n--- Get ready for class: '{class_name}' ---")
        print("Press 's' to start recording 100 frames for this class.")
        print("Press 'n' to skip to the next class.")

        # Wait for user to start
        while True:
            ret, frame = cap.read()
            if not ret: continue

            cv2.putText(frame, f"Ready for: {class_name}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, "Press 's' to start | 'n' to skip | 'q' to quit", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.imshow('Data Collection', frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('s'):
                break
            elif key == ord('n'):
                break
            elif key == ord('q'):
                cap.release()
                cv2.destroyAllWindows()
                return

        if key == ord('n'):
            continue

        # Start recording
        count = 0
        while count < SAMPLES_PER_CLASS:
            ret, frame = cap.read()
            if not ret: continue

            # Convert to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                    
                    # Extract coordinates
                    row = [class_index]
                    for landmark in hand_landmarks.landmark:
                        row.extend([landmark.x, landmark.y, landmark.z])
                    
                    # Save to CSV
                    with open(DATASET_PATH, mode='a', newline='') as f:
                        writer = csv.writer(f)
                        writer.writerow(row)
                    
                    count += 1

            cv2.putText(frame, f"Recording '{class_name}' : {count}/{SAMPLES_PER_CLASS}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.imshow('Data Collection', frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                cap.release()
                cv2.destroyAllWindows()
                return
            
            time.sleep(0.05) # slight delay to capture variations

    cap.release()
    cv2.destroyAllWindows()
    print("Data Collection Complete!")

if __name__ == "__main__":
    collect_data()
