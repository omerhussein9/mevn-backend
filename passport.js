// passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Define your User model

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      console.log('Authenticating user:', email); // Log the email being authenticated
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log('Incorrect email or password.')
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
