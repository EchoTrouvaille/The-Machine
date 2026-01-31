<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17PUgeyQ57w94AeHWtCUnFFmtl8Oc3xdJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your Gemini API key:

   Create a `.env.local` file in the project root and add your API key:
   ```bash
   echo "GEMINI_API_KEY=your_actual_api_key_here" > .env.local
   ```

   Replace `your_actual_api_key_here` with your actual Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

   **Note:** The `.env.local` file is already in `.gitignore` and will not be committed to version control.

3. Run the app:
   ```bash
   npm run dev
   ```

   Follow the URL shown in the terminal to open the app in your browser (typically http://localhost:3000).
