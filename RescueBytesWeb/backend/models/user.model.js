import mongoose from 'mongoose';



const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name:{
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'volunteer', 'moderator'],
    default: 'user'
  },
  RescueCenters: {
    type: Schema.Types.ObjectId,
    ref: 'RescueCenter',
    required:true,
  },
  pfpLink: {
    type: String,
    default: 'default-profile-picture.jpg'
  },
  sessionToken: { type: String, default: null },

  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  

  this.lastUpdated = Date.now();
  next();
});

const User = mongoose.model('User', UserSchema);

export default User;