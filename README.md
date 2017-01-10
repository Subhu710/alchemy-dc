# dc-alchemy-sample Overview

This Node.js Application demonstrates how Custom entities can be identified in a PDF document. PDF documents when uploaded gets converted into sections using Watson Document Conversion service. Alchemy Language's getEntities API is then used using a Custom trained model to get entities present in the sections of the PDF document.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/purukn/dc-alchemy-sample)

**Note:** Please add new bindings for Document Conversion and Alchemy Language Services for the newly created application. Alternatively, you can mention access information of already existing Services as below in Environment Variables:

API_KEY=alchemy_language_api_key

MODEL_ID=alchemy_language_custom_model_id

DC_USER_NAME=document_conversion_user_name

DC_PASSWORD=document_conversion_password

## Run the app locally

1. [Install Node.js][]
2. Download and extract the starter code from the Bluemix UI
3. cd into the app directory
4. Add a .env file in app directory providing values for above mentioned environment variables
5. Run `npm install` to install the app's dependencies
6. Run `npm start` to start the app
7. Access the running app in a browser at http://localhost:6001

[Install Node.js]: https://nodejs.org/en/download/

## API information

URL: /entities (POST)
Input: PDF document uploaded as form-data parameter named "file"
