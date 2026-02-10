@echo off
echo Setting up NewsMania...

echo Creating server...
if not exist server mkdir server
cd server
call npm init -y
call npm install express mongoose dotenv cors cloudinary multer
cd ..

echo Creating client...
if not exist client call npx -y create-vite@latest client -- --template react
cd client
call npm install
call npm install axios react-router-dom framer-motion date-fns react-icons tailwindcss postcss autoprefixer
call npx tailwindcss init -p
cd ..

echo Setup complete!
pause
