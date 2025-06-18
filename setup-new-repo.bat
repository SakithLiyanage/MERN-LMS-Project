@echo off
echo Setting up new Git repository...

rem Initialize new Git repository
git init

rem Add all files
git add .

rem Create initial commit
git commit -m "Initial commit of MERN LMS Project"

echo.
echo ---------------------------------------------
echo New Git repository has been set up locally!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Run the following commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
echo    git branch -M main
echo    git push -u origin main
echo ---------------------------------------------
