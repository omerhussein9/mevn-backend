// Import required modules
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport'); // Import the configured Passport instance
require('./passport');
require('./db'); // Import Mongoose configuration
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Assuming User model is defined in a separate file
const authRoutes = require('./routes/auth');
const generateSalt = require('./saltGenerator');
const bodyParser = require('body-parser')
const cron = require('node-cron')
const nodemailer = require('nodemailer')

// Initialize Express app
const app = express();
app.use(cors()); // Enable CORS for all routes

// Middleware setup
app.set('view engine', 'ejs'); // Assuming you're using EJS for templating
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: `${generateSalt()}`, 
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Mount authentication routes
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes); // make sure the above two lines are set up before this

const isAuthenticated = (req, res, next) => {
  // Passport adds 'req.user' property if user is authenticated
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware
    return next();
  }
  // User is not authenticated, redirect to login page or send error response
  res.redirect('/login'); // Redirect to login page
};

// Middleware function to check if user has specific role/permission
const hasPermission = (requiredRole) => {
  return (req, res, next) => {
    // Check if user has the required role/permission
    if (req.user && req.user.role === requiredRole) {
      // User has the required role/permission, proceed to the next middleware
      return next();
    }
    // User does not have the required role/permission, send error response
    res.status(403).send('Forbidden'); // Send 403 Forbidden status
  };
};

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the application!');
});

app.get('/login', (req, res) => {
  res.send('This is the Login Page')
});

app.get('/dashboard', (req, res) => {
  res.send('Welcome to the dashboard!');
});

app.get('/logoutConfirmed', (req, res) => {
  res.send('You have logged out!');
});

// Example route that requires authentication and specific role
app.get('/admin', isAuthenticated, hasPermission('admin'), (req, res) => {
  // Route handler for admin route
  res.send('Welcome to the admin dashboard!');
});

// adding events to the APIs
const Event = require('./models/Event');

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try { 
    const event = new Event(req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events', async (req, res) => {
  try {
    if(req.body.place) {
      await Event.deleteOne({
        "place": req.body.place,
        "date": req.body.date,
        "time": req.body.time,
        "address": req.body.address,
        "team1": req.body.team1,
        "team2": req.body.team2,
      })
    } else if(req.body.team1) {
      await Event.deleteOne({
        "team1": req.body.team1
      })
    } else if (req.body.team2) {
      await Event.deleteOne({
        "team2": req.body.team2
      })
    } else {
      await Event.deleteOne({
        "type": req.body.id
      })
    }

    res.status(200).json({ message: 'event deleted successfully ggs guys' })
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
})

// adding leagues to the APIs
const League = require('./models/League');

app.get('/api/leagues', async (req, res) => {
  try {
    const leaguesResponse = await League.find({});
    res.json(leaguesResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

app.post('/api/leagues', async (req, res) => {
  try {
    const league = new League(req.body);
    await league.save();
    res.json(league);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

app.delete('/api/leagues', async (req, res) => {
  try {
    await League.deleteOne({
      name: req.body.name,
    })

    res.status(200).json({ message: "team successfully deleted 200" })
  } catch (ex) {
    console.error('error deleting team', ex)
  }
})


// adding teams to the APIs
const Team = require('./models/Team');

app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find({});
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teams', async (req, res) => {
  try {
    if(req.body.league !== "NO LEAGUES HERE SORRY GUYS GGS MAN THIS PROJECT IS SO GOOD HOPEFULLY NO ONE CALLS THEIR LEAGUE THIS") {
      await Team.deleteOne({
        name: req.body.name,
        league: req.body.league
      })
    } else {
      await Team.deleteOne({
        league: req.body.league
      })
    }

    res.status(200).json({ message: "team successfully deleted 200" })
  } catch (ex) {
    console.error('error deleting team', ex)
  }
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ics4umailer@gmail.com',
    pass: '456456cyrus'
  }
})

cron.schedule('0 0 * * *', async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const events = await Event.find({ date: today.toJSON().slice(0, 10) })

  events.forEach(async (event) => {
    // Find users who requested notifications for this event
    const users = event.emails

    // Send email notifications to users
    for (const user of users) {
      await transporter.sendMail({
        from: 'ics4umailer@gmail.com',
        to: user,
        subject: `Reminder: ${event.team1} vs ${event.team2} Today!`,
        text: `Don't forget, ${event.team1} vs ${event.team2} is happening today!`,
      });
    }
  })
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
