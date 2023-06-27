
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect('mongodb+srv://Prateek:EjCOPVeGUt3mVxBR@cluster0.ukgaesh.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });


const driveDataSchema = new mongoose.Schema({
  name: String,
  mimeType: String,
  size: Number,
  webViewLink: String,
});

const DriveData = mongoose.model('DriveData', driveDataSchema);


const CLIENT_ID = '407623368566-fuh7420gino01uec19tl4ror8brogcpd.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5000/api/auth/callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

let driveAPI;


const initDriveAPI = (accessToken) => {

  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

         oAuth2Client.setCredentials({ access_token: accessToken });

  driveAPI = google.drive({ version: 'v3', auth: oAuth2Client });
};


app.get('/api/auth', (req, res) => {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });

  res.json({ authUrl });
});


app.get('/api/auth/callback', async (req, res) => {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    const accessToken = tokens.access_token;

    initDriveAPI(accessToken);

    res.redirect(`http://localhost:3000/?accessToken=${accessToken}`);
  } catch (err) {
    console.error('Error authenticating:', err);

    res.status(500).send('Error authenticating');
  }
});


app.get('/api/analytics', async (req, res) => {
  
  
  const { authorization } = req.headers;

  const accessToken = authorization.split(' ')[1];

  try {


    initDriveAPI(accessToken);

    const response = await driveAPI.files.list({
      fields: 'files(name, mimeType, size, webViewLink)',
      pageSize: 10,
    });

    const files = response.data.files.map((file) => ({
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      webViewLink: file.webViewLink,
    }));

    await DriveData.create(files); 

    res.json(files);
  } catch (err) {
    console.error('Error fetching Drive data:', err);
    res.status(500).send('Error fetching Drive data');
  }
});

app.post('/api/revoke', (req, res) => {
  const { accessToken } = req.body;

  try {
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    oAuth2Client.setCredentials({ access_token: accessToken });

        oAuth2Client.revokeCredentials();

   res.sendStatus(200);
  } catch (err) {
    console.error('Error revoking access:', err);
    res.status(500).send('Error revoking access');
  }
});


app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
