import mongoose from 'mongoose';

const exerciseSetSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  weight: { type: Number, default: 10 },
  reps: { type: Number, default: 0 },
  restSeconds: { type: Number, default: 60 },
  isCompleted: { type: Boolean, default: false },
}, { _id: false });

const workoutExerciseSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  name: { type: String, required: true },
  gifUrl: { type: String, required: true },
  targetMuscles: [String],
  bodyParts: [String],
  equipments: [String],
  sets: { type: [exerciseSetSchema], default: [] },
  notes: { type: String, default: '' },
}, { _id: false });

const workoutSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  planId: { type: String }, // optional reference to WorkoutPlan
  workoutPlanName: { type: String, required: true },
  exercises: { type: [workoutExerciseSchema], default: [] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationSeconds: { type: Number, required: true },
  totalSets: { type: Number, default: 0 },
  completedSets: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  bodyWeight: { type: Number },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

workoutSessionSchema.index({ userId: 1, startTime: -1 });

// Force reload the model in development to pick up schema changes
if (mongoose.models.WorkoutSession && process.env.NODE_ENV === 'development') {
  delete mongoose.models.WorkoutSession;
}

export default mongoose.models.WorkoutSession || mongoose.model('WorkoutSession', workoutSessionSchema);
