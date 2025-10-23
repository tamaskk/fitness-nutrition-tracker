import mongoose from 'mongoose';

// Set subdocument for per-exercise configuration
const exerciseSetSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  weight: { type: Number, default: 10 },
  reps: { type: Number, default: 0 },
  restSeconds: { type: Number, default: 60 },
  isCompleted: { type: Boolean, default: false },
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  gifUrl: {
    type: String,
    required: true,
  },
  targetMuscles: [String],
  bodyParts: [String],
  equipments: [String],
  secondaryMuscles: [String],
  instructions: [String],
  // Optional notes and configured sets (kg, reps, rest)
  notes: { type: String, default: '' },
  sets: { type: [exerciseSetSchema], default: [] },
});

const muscleGroupCountSchema = new mongoose.Schema({
  muscleName: {
    type: String,
    required: true,
  },
  bodyPart: {
    type: String,
    required: true,
  },
  exerciseCount: {
    type: Number,
    required: true,
  },
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  muscleGroups: [muscleGroupCountSchema],
  exercises: [exerciseSchema],
  totalExercises: {
    type: Number,
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },
});

// Index for faster queries
workoutPlanSchema.index({ userId: 1, savedAt: -1 });

export default mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', workoutPlanSchema);


