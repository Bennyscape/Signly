# ASL Custom Model Training Pipeline

This folder contains the scripts needed to collect custom hand gesture data using your webcam and train a new Neural Network model that is perfectly compatible with the main web application.

## Prerequisites

Make sure you have Python installed (preferably Python 3.9 - 3.11).

1. Open your terminal in this `training` folder.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Part 1: Data Collection

We need to collect coordinate data (X,Y,Z positions of your hand joints) for each ASL letter.

Run the data collector script:
```bash
python collect_data.py
```

- The script will open your webcam.
- It iterates through each label (`A` to `Z`, `space`, etc.).
- Position your hand to sign the current letter.
- Press **`s`** to start capturing 100 frames of data for that letter. Try to move your hand slightly (change angles/distance) to give the model diverse data.
- It will automatically move to the next letter.
- Press **`n`** to skip a letter, or **`q`** to quit completely.

The data is saved to a single file called `dataset.csv`.

## Part 2: Model Training and Export

Once you have recorded your `dataset.csv`, it's time to train the artificial neural network!

Run the training script:
```bash
python train_model.py
```

- This script uses TensorFlow/Keras to build a 3-layer Dense Neural Network.
- It trains on your `dataset.csv`, aiming for at least 95%+ validation accuracy.
- When finished, it saves the raw model as `asl_model.h5`.
- **Crucially, it utilizes the `tensorflowjs` library to convert the model into a web-readable format.** 
- The web model is output into the new `tfjs_model/` folder.

## Part 3: Using the Model in the Web App

The training script generates a `model.json` file, a `.bin` weights file, and a `labels.json` file inside the `tfjs_model/` folder.

1. Copy all the files from `tfjs_model/`.
2. Paste them into the main project's `public/models/alphabet/` folder (overwrite any existing files there).
3. Reload your Next.js application. Your new AI model is now active!
