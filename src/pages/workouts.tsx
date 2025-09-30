import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import WorkoutForm from '@/components/WorkoutForm';
import { getCurrentDateString } from '@/utils/dateUtils';
import { WorkoutEntry, WorkoutFormData } from '@/types';
import { Plus, Clock, Dumbbell, Trash2, Activity } from 'lucide-react';
import { getExerciseTypeColor, formatCalories } from '@/utils/calculations';
import toast from 'react-hot-toast';

const WorkoutsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchWorkouts();
  }, [session, status, router, selectedDate]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`/api/workouts?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = async (workoutData: WorkoutFormData & { date: string; notes?: string }) => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        throw new Error('Failed to add workout');
      }

      toast.success('Workout logged successfully!');
      fetchWorkouts(); // Refresh the workouts list
    } catch (error) {
      console.error('Error adding workout:', error);
      toast.error('Failed to log workout');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workouts?id=${workoutId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      toast.success('Workout deleted successfully!');
      fetchWorkouts(); // Refresh the workouts list
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) return null;

  const totalCaloriesBurned = workouts.reduce((sum, workout) => sum + workout.totalCalories, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
            <p className="text-gray-600">Track your exercise and fitness progress</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={() => setShowWorkoutForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Workout
            </button>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Workouts Today</p>
                <p className="text-2xl font-bold text-gray-900">{workouts.length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exercises</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workouts.reduce((sum, workout) => sum + workout.exercises.length, 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                <p className="text-2xl font-bold text-gray-900">{formatCalories(totalCaloriesBurned)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workouts List */}
        {workouts.length > 0 ? (
          <div className="space-y-6">
            {workouts.map((workout) => (
              <div key={workout._id} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Workout Session
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {workout.createdAt && new Date(workout.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {formatCalories(workout.totalCalories)} calories burned
                        </span>
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteWorkout(workout._id!)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Exercises */}
                  <div className="space-y-4">
                    {workout.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{exercise.sets} sets</span>
                            {exercise.reps && <span>{exercise.reps} reps</span>}
                            {exercise.weightKg && <span>{exercise.weightKg} kg</span>}
                            {exercise.durationSeconds && (
                              <span>{Math.round(exercise.durationSeconds / 60)} minutes</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCalories(exercise.caloriesBurned)} cal
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {workout.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                      <p className="text-sm text-gray-700">{workout.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No workouts logged</h3>
            <p className="mt-2 text-gray-600">Get started by logging your first workout!</p>
            <div className="mt-6">
              <button 
                onClick={() => setShowWorkoutForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Workout
              </button>
            </div>
          </div>
        )}

        {/* Workout Form Modal */}
        <WorkoutForm
          isOpen={showWorkoutForm}
          onClose={() => setShowWorkoutForm(false)}
          onSubmit={handleAddWorkout}
          initialDate={selectedDate}
        />
      </div>
    </Layout>
  );
};

export default WorkoutsPage;
