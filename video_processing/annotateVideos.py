import cv2
import mediapipe as mp
import numpy as np
import sys

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Customize the DrawingaSpec for purple circles and white lines
purple_circle_spec = mp_drawing.DrawingSpec(color=(128, 0, 128), thickness=2, circle_radius=3)
white_line_spec = mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2)

pose = mp_pose.Pose(min_detection_confidence=0.3, min_tracking_confidence=0.3)

cap = cv2.VideoCapture(sys.argv[1])

if not cap.isOpened():
    print("Error opening video stream or file")
    raise TypeError

frame_width = int(cap.get(3))
frame_height = int(cap.get(4))
fps = int(cap.get(cv2.CAP_PROP_FPS))  # Get the FPS of the input video

outdir, inputflnm = sys.argv[1][:sys.argv[1].rfind(
    '/')+1], sys.argv[1][sys.argv[1].rfind('/')+1:]
inflnm, inflext = inputflnm.split('.')
out_filename = f'{outdir}{inflnm}_annotated.mp4'  # Ensure the output is .mp4 for compatibility
text_filename = f'{outdir}{inflnm}_pose_vectors.txt'
out = cv2.VideoWriter(out_filename, cv2.VideoWriter_fourcc(*'avc1'), fps, (frame_width, frame_height))  # Use 'H.264' codec for browser compatibility

# Open the text file for writing
with open(text_filename, 'w') as text_file:
    frame_count = 0

    while cap.isOpened():
        ret, image = cap.read()
        if not ret:
            break

        image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        # Draw landmarks with purple color and connections with white color
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                image, 
                results.pose_landmarks, 
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=purple_circle_spec,
                connection_drawing_spec=white_line_spec
            )
            
            # Extract pose vectors for every frame
            landmarks = results.pose_landmarks.landmark
            vector = []
            for landmark in landmarks:
                vector.extend([landmark.x, landmark.y, landmark.z])

            # Write the vector in the format [x1, y1, z1, x2, y2, z2, ...]
            text_file.write(f'{vector}\n')
        
        out.write(image)
        frame_count += 1

pose.close()
cap.release()
out.release()