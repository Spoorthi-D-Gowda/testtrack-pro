const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {

      const email = profile.emails[0].value;

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // 🔥 Don't create user yet
        return done(null, {
          email,
          name: profile.displayName,
          googleId: profile.id,
          isNewUser: true
        });
      }

      return done(null, user);
    }
  )
);

module.exports = passport;