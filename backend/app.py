from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)

CORS(app)

cred = credentials.Certificate("./blackbox-admin-sdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# post request to process video
@app.route("/video_process", methods=["POST"])
def video_process():
    data = request.get_json()
    
    video_path = data["videoURL"]
    try:
        vectorData = annoate_video(video_path)
        data["vectorData"] = vectorData
    except Exception as e:
        return jsonify({"message": f"Failed to process video\nError: {e}"}), 500
    
    try:
        db.collection("videos").add(data)
    except Exception as e:
        return jsonify({"message": f"Failed to upload to firebase\nError: {e}"}), 500
    
    return jsonify({"message": "success"}), 200

def annoate_video(video_path):
    data = ""
    
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    # Customize the DrawingSpec for purple circles and white lines
    purple_circle_spec = mp_drawing.DrawingSpec(color=(128, 0, 128), thickness=2, circle_radius=3)
    white_line_spec = mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2)

    pose = mp_pose.Pose(min_detection_confidence=0.3, min_tracking_confidence=0.3)

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Error opening video stream or file")
        raise TypeError

    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    fps = int(cap.get(cv2.CAP_PROP_FPS))  # Get the FPS of the input video

    out_filename = f'video_annotated.mp4'  # Ensure the output is .mp4 for compatibility
    out = cv2.VideoWriter(out_filename, cv2.VideoWriter_fourcc(
        *'avc1'), fps, (frame_width, frame_height))  # Use 'H.264' codec for browser compatibility

    # write to array
    frame_count = 0

    while cap.isOpened():
        ret, image = cap.read()
        if not ret:
            break

        if (frame_count % fps == 0):
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
                data += f'{vector}\n'
        
        if frame_count % fps == 0:
            out.write(image)
        frame_count += 1

    pose.close()
    cap.release()
    out.release()
    return data

if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
