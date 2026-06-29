const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },

    // Skills
    skillsTeach: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    skillsLearn: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    // Gamification
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },

    // Auth
    refreshToken: {
      type: String,
      select: false,
    },

    isProfileComplete: {
      type: Boolean,
      default: false, // true after SetupPage is filled
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      select: false,
    },

    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    
  },
  { timestamps: true }
);

// Before save, hash User's Psswd
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Helper Function to check if password is correct (hashes & Compares the plain psswd gotten from User)
userSchema.methods.isPasswordCorrect = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
