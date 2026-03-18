# Contributing to CampusOR 🚀

Thank you for your interest in contributing to **CampusOR**! We are excited to have you help us build the future of smart campus queue management.

CampusOR is a centralized virtual queue and reservation system designed to eliminate physical lines using real-time updates, PWA technology, and ML-based wait-time predictions.

---

##  Contribution Workflow

To keep the project organized, please follow these steps:

1. **Find an Issue**: Browse the "Issues" tab and find one that interests you.
2. **Claim It**: Comment `I would like to work on this` on the issue.
3. **Wait for Assignment**: Please wait for a maintainer to assign the issue to you.
4. **Fork & Branch**: Fork the repository and create a branch:
   `git checkout -b feature/your-feature-name` or `git checkout -b fix/your-fix-name`.
5. **Develop**: Implement your changes and test locally.
6. **Submit**: Open a Pull Request (PR) against the `main` branch.

---

## Local Development Setup

Follow these steps to get **CampusOR** running on your machine.

###  Prerequisites
Ensure you have the following installed:
* **Node.js** (v18 or higher)
* **npm** or **yarn**
* **Git**
* **Python 3.x** (Required for the ML microservice)

### 1. Fork and Clone
```bash
git clone [https://github.com/](https://github.com/)<your-username>/campus-or.git
cd campus-or

###  2. Backend Setup
```bash
cd server
npm install

# Setup Environment Variables
cp .env.example .env
# Fill in Database URL, JWT secret, and API keys in .env

# Start Server
npm run dev
npm run build
npm run start
# Backend runs on: http://localhost:5000
```
### 3. Frontend Setup
```bash
# Open a new terminal
cd client
npm install
npm run dev
# Frontend runs on: http://localhost:3000
```
### 4. Machine Learning Setup
```bash
cd server/ml
pip install -r requirements.txt

# Train the model (generates model.pkl)
python app.py
```
--
## Branching Commits
#### Branching naming convention
Use clear and consistent names
* **`feature/login-ui`**
* **`ml/train-random-forest`**
* **`fix/auth-token-error`**
* **`docs/update-readme`**

#### Create branch: `git checkout -b feature/your-branch-name`

#### Commit Message Guidelines
* **`feat/: add QR-based check in`**
* **`fix/: fixed socket connections`**
* **`ui/: styling or layout changes`**
--

## Pull request Rules
* **Link the issue** : Always mention the issue number in your PR description (e.g., Closes #10)
* **Screenshots**: If you changed the UI, please include a screenshot or a short GIF.
* **Keep it focused**: One PR should solve one specific issue.
* **No console logs**: Please remove console.log() and debug statements before submitting.
* **Update Contributors**: Don't forget to add your name to the CONTRIBUTORS.md file!
--

## Definition of done
1. The code runs without errors in a local environment.
2. The UI looks consistent across Desktop and Mobile (PWA responsive).
3. Real-time features (WebSockets) work as expected.
4. The code is reviewed and merged by a maintainer.
--

## Community Guidelines
* **Be Respectful**: Treat all contributors with kindness.
* **Inclusive**: We welcome everyone.
* **Feedback**: Keep it constructive and helpful.
