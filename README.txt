ONLINE MOVIE TICKET BOOKING SYSTEM
==================================

TECHNOLOGIES
- HTML, CSS, JavaScript
- Node.js and Express.js
- MySQL

PROJECT FOLDER STRUCTURE
Online_Movie_Ticket_Booking_System/
  package.json
  server.js
  database.sql
  README.txt
  public/
    index.html
    style.css
    script.js

STEP 1: OPEN IN VISUAL STUDIO CODE
1. Extract the ZIP file.
2. Open Visual Studio Code.
3. Click File > Open Folder.
4. Select the extracted Online_Movie_Ticket_Booking_System folder.

STEP 2: CREATE THE DATABASE
1. Open MySQL Workbench.
2. Connect to your local MySQL server.
3. Open database.sql from this project.
4. Click the lightning bolt (Execute).
5. The movie_booking database and four tables will be created:
   users, movies, shows, bookings.

STEP 3: CHECK MYSQL PASSWORD
Open server.js.
In the database connection, change password: "root" to your own MySQL root password.
If your MySQL password is blank, use password: "".

STEP 4: INSTALL PACKAGES
In VS Code, click Terminal > New Terminal.
Make sure the terminal is inside the project folder, then run:

npm install

STEP 5: START THE WEBSITE
Run:

npm start

When you see:
MySQL Database Connected Successfully!
Server running at http://localhost:3000

Open Chrome and enter:
http://localhost:3000

IMPORTANT
- Do not open index.html directly.
- Do not use Live Server for this project.
- Keep the Node.js terminal running while using the website.
- The demo form stores a placeholder password because this assignment's booking flow does not include login.
- Sample movies and show timings are inserted by database.sql.
- This is an academic demo project. It does not process real payments or maintain individual seat numbers.
