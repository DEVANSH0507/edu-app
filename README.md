# StudyNotion - Education Website Backend

## Project Overview
StudyNotion is a full-featured education platform backend designed to manage courses, categories, users, and sections efficiently. This backend supports RESTful APIs for frontend integration and includes cloud services integration.

## Features
- User authentication and profile management
- Course creation, update, and deletion
- Category management with course associations
- Section and subsection handling with CRUD operations
- Email notifications using **Nodemailer**
- Media upload and management using **Cloudinary**
- Postman API collection available for easy testing

## Technologies Used
- Node.js
- Express.js
- MongoDB & Mongoose
- Cloudinary (for image and media storage)
- Nodemailer (for sending emails)
- Postman (API testing)

## Setup Instructions
1. Clone this repository
2. Run `npm install` to install dependencies
3. Create a `.env` file and configure:
PORT=4000
MONGODB_URI=your_mongo_db_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

4. Start the server:

## API Documentation - Postman
- A **Postman collection** is included in the `postman` folder of this repository.
- Import the collection into Postman to get all the API endpoints pre-configured for testing.
- The collection contains examples for all major endpoints: user authentication, course management, category management, sections, and more.
- Make sure your backend server is running locally or update the base URL in Postman accordingly before testing.

## Contributing
Feel free to open issues or submit pull requests for improvements.

## License
This project is licensed under the MIT License.

---

**Contact:** - devansh2634gupta@gmail.com
