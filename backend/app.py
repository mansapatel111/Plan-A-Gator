from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # allows frontend (React) to talk to backend 

app.secret_key = os.getenv("SECRET_KEY")

@app.route("/")
def index():
    return "Welcome to Plan A Gator Flask backend!"

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify(message="Hello from Flask!")

@app.route("/api/upload", methods=["POST"])
def upload_transcript():
    file = request.files.get("file")
    if not file:
        return jsonify(error="No file uploaded"), 400
    # TODO: parse transcript here
    return jsonify(message="Transcript received!")


if __name__ == "__main__":
    app.run(debug=os.getenv("DEBUG", "False") == "True")
