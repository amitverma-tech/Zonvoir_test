Task Manager Application

This is a full-stack Task Manager application built using Laravel (backend API) and React (frontend using Vite inside Laravel). The application allows users to register, login, and manage their tasks through a simple and modern dashboard interface.

Setup Instructions

Clone the repository
Clone the project to your local machine using Git and navigate into the project folder.

git clone <your-repository-link>
cd task-manager

Install dependencies
Install backend and frontend dependencies.

For Laravel (backend):
composer install

For React (frontend):
npm install

Configure environment
Create a .env file by copying the example file.

cp .env.example .env

Then update your database credentials inside the .env file:

DB_DATABASE=your_database_name
DB_USERNAME=root
DB_PASSWORD=

Generate application key
Run the following command to generate the application key.

php artisan key:generate

Run database migrations
This will create all required tables in your database.

php artisan migrate

Start the application
Run both backend and frontend servers.

php artisan serve
npm run dev

Access the application
Open your browser and go to:

http://127.0.0.1:8000

Features

User registration and login using Laravel Sanctum
Task management (create, view, delete tasks)
Dashboard with task overview
Responsive UI using Tailwind CSS
Toast notifications for success and error messages

Tech Stack

Backend: Laravel 12, Sanctum, MySQL
Frontend: React, Vite, Tailwind CSS, Axios, React Router, React Toastify

Notes

Make sure MySQL server is running before running migrations
Ensure Node.js and Composer are installed
Replace <your-repository-link> with your actual GitHub repository link before sharing