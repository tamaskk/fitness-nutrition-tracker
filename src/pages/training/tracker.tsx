import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Play, Pause, Square, Check, Clock, Dumbbell, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Exercise {
  _id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  description?: string;
  equipment?: string;
  difficulty: string;
  reps?: number;
  sets?: number;
  weight?: number;
  rest?: number;
}

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
}

interface Workout {
  _id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  difficulty: string;
  estimatedDuration: number;
  tags: string[];
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  duration?: number;
  completed: boolean;
  restTime?: number;
  notes?: string;
}

interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: CompletedSet[];
  totalSets: number;
  completedSets: number;
}

interface WorkoutSession {
  workoutId: string;
  workoutName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  exercises: CompletedExercise[];
  totalCaloriesBurned?: number;
  notes?: string;
  status: 'processing' | 'in-progress' | 'paused' | 'completed' | 'failed';
}

const TrackerPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Load workouts first, then load sessions
    const initializeTracker = async () => {
      await loadWorkouts();
      
      // Check if there's a specific session ID in the URL
      const sessionId = router.query.session as string;
      if (sessionId) {
        loadSpecificSession(sessionId);
      } else {
        loadActiveSession();
      }
    };
    
    initializeTracker();
  }, [session, status, router, router.query.session]);

  // Save progress to database whenever workout state changes
  useEffect(() => {
    if (workoutSession && isWorkoutActive && currentSessionId) {
      updateSessionInDatabase();
    }
  }, [workoutSession, currentExerciseIndex, currentSet, isWorkoutActive]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      } else {
        toast.error('Nem sikerült betölteni az edzésterveket');
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Hiba történt az edzéstervek betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSession = async () => {
    try {
      const response = await fetch('/api/training/sessions');
      if (response.ok) {
        const data = await response.json();
        // Find active session (processing, in-progress, or paused)
        const activeSession = data.find((session: any) => 
          session.status === 'processing' || 
          session.status === 'in-progress' || 
          session.status === 'paused'
        );
        
        if (activeSession) {
          await loadSessionData(activeSession);
        }
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const loadSpecificSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/training/sessions');
      if (response.ok) {
        const data = await response.json();
        const specificSession = data.find((session: any) => session._id === sessionId);
        
        if (specificSession) {
          await loadSessionData(specificSession);
        } else {
          toast.error('Edzés munkamenet nem található');
          router.push('/training/tracker');
        }
      }
    } catch (error) {
      console.error('Error loading specific session:', error);
      toast.error('Hiba történt az edzés betöltésekor');
    }
  };

  const loadSessionData = async (sessionData: any) => {
    // Find the corresponding workout
    let workout = workouts.find(w => w._id === sessionData.workoutId);
    
    // If workout not found in current workouts array, try to fetch it
    if (!workout) {
      try {
        const response = await fetch('/api/training/workouts');
        if (response.ok) {
          const allWorkouts = await response.json();
          workout = allWorkouts.find((w: any) => w._id === sessionData.workoutId);
        }
      } catch (error) {
        console.error('Error fetching workouts for session:', error);
      }
    }
    
    if (workout) {
      setWorkoutSession(sessionData);
      setSelectedWorkout(workout);
      setCurrentSessionId(sessionData._id);
      setIsWorkoutActive(sessionData.status === 'in-progress');
      setShowWorkoutSelector(false);
      
      // Calculate current exercise and set based on completed sets
      let exerciseIndex = 0;
      let setIndex = 1;
      
      for (let i = 0; i < sessionData.exercises.length; i++) {
        const exercise = sessionData.exercises[i];
        if (exercise.completedSets < exercise.totalSets) {
          exerciseIndex = i;
          // Find the first incomplete set
          const incompleteSet = exercise.sets.find((set: any) => !set.completed);
          setIndex = incompleteSet ? incompleteSet.setNumber : exercise.completedSets + 1;
          break;
        }
      }
      
      setCurrentExerciseIndex(exerciseIndex);
      setCurrentSet(setIndex);
      
      toast.success('Edzés betöltve!');
    } else {
      toast.error('Edzésterv nem található');
      router.push('/training/tracker');
    }
  };

  const updateSessionInDatabase = async () => {
    if (!workoutSession || !currentSessionId) return;
    
    try {
      const response = await fetch(`/api/training/sessions?id=${currentSessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercises: workoutSession.exercises,
          status: isWorkoutActive ? 'in-progress' : 'paused',
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update session in database');
      }
    } catch (error) {
      console.error('Error updating session in database:', error);
    }
  };

  const startWorkout = async (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutSelector(false);
    
    const session: WorkoutSession = {
      workoutId: workout._id,
      workoutName: workout.name,
      startTime: new Date(),
      exercises: workout.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        sets: Array.from({ length: exercise.sets }, (_, index) => ({
          setNumber: index + 1,
          reps: exercise.reps,
          weight: exercise.weight,
          restTime: exercise.restTime,
          completed: false,
        })),
        totalSets: exercise.sets,
        completedSets: 0,
      })),
      status: 'processing',
    };

    try {
      const response = await fetch('/api/training/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        const savedSession = await response.json();
        setWorkoutSession(savedSession);
        setCurrentSessionId(savedSession._id);
        setIsWorkoutActive(true);
        setCurrentExerciseIndex(0);
        setCurrentSet(1);
        
        // Update status to in-progress
        await fetch(`/api/training/sessions?id=${savedSession._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'in-progress' }),
        });
        
        toast.success('Edzés elindítva!');
      } else {
        toast.error('Hiba történt az edzés indításakor');
        setShowWorkoutSelector(true);
      }
    } catch (error) {
      console.error('Error starting workout:', error);
      toast.error('Hiba történt az edzés indításakor');
      setShowWorkoutSelector(true);
    }
  };

  const completeSet = () => {
    if (!workoutSession || !selectedWorkout) return;

    const updatedSession = { ...workoutSession };
    const currentExercise = updatedSession.exercises[currentExerciseIndex];
    
    // Find and mark the current set as completed
    const currentSetData = currentExercise.sets.find((set: any) => set.setNumber === currentSet);
    if (currentSetData) {
      currentSetData.completed = true;
      currentExercise.completedSets += 1;
    }
    
    if (currentExercise.completedSets >= currentExercise.totalSets) {
      // Exercise completed
      if (currentExerciseIndex < selectedWorkout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
        toast.success('Gyakorlat befejezve! Következő gyakorlat...');
      } else {
        // Workout completed
        finishWorkout();
        return;
      }
    } else {
      // Find the next incomplete set
      const nextIncompleteSet = currentExercise.sets.find((set: any) => !set.completed);
      if (nextIncompleteSet) {
        setCurrentSet(nextIncompleteSet.setNumber);
      } else {
        setCurrentSet(currentSet + 1);
      }
      toast.success('Szett befejezve!');
    }

    setWorkoutSession(updatedSession);
  };

  const finishWorkout = async () => {
    if (!workoutSession || !selectedWorkout || !currentSessionId) return;

    const endTime = new Date();
    const startTime = new Date(workoutSession.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes

    try {
      const response = await fetch(`/api/training/sessions?id=${currentSessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercises: workoutSession.exercises,
          status: 'completed',
          endTime,
          duration,
        }),
      });

      if (response.ok) {
        toast.success('Edzés befejezve és mentve!');
        resetWorkout();
        // Refresh the parent page to update active sessions
        if (window.parent && window.parent !== window) {
          window.parent.location.reload();
        }
      } else {
        toast.error('Hiba történt az edzés mentésekor');
      }
    } catch (error) {
      console.error('Error saving workout session:', error);
      toast.error('Hiba történt az edzés mentésekor');
    }
  };

  const saveProgress = async () => {
    if (!workoutSession || !selectedWorkout) return;

    const endTime = new Date();
    const startTime = new Date(workoutSession.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes

    const progressSession = {
      ...workoutSession,
      endTime,
      duration,
      status: 'paused',
    };

    try {
      const response = await fetch('/api/training/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressSession),
      });

      if (response.ok) {
        toast.success('Edzés haladás mentve az adatbázisba!');
        setIsWorkoutActive(false);
        setShowWorkoutSelector(true);
      } else {
        toast.error('Hiba történt a haladás mentésekor');
      }
    } catch (error) {
      console.error('Error saving workout progress:', error);
      toast.error('Hiba történt a haladás mentésekor');
    }
  };

  const resetWorkout = () => {
    setSelectedWorkout(null);
    setIsWorkoutActive(false);
    setWorkoutSession(null);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setShowWorkoutSelector(true);
    setCurrentSessionId(null);
  };

  const getCurrentExercise = () => {
    if (!selectedWorkout || !workoutSession) return null;
    return selectedWorkout.exercises[currentExerciseIndex];
  };

  const getCurrentExerciseProgress = () => {
    if (!workoutSession) return null;
    return workoutSession.exercises[currentExerciseIndex];
  };

  const getWorkoutProgress = () => {
    if (!workoutSession) return 0;
    const totalSets = workoutSession.exercises.reduce((total, ex) => total + ex.totalSets, 0);
    const completedSets = workoutSession.exercises.reduce((total, ex) => total + ex.completedSets, 0);
    return Math.round((completedSets / totalSets) * 100);
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/training')}
              className="text-blue-600 hover:text-blue-800 font-medium mr-4"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Vissza az edzéshez
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edzés követése</h1>
          <p className="mt-2 text-gray-600">
            Indítsd el az edzéstervet és kövesd a haladásodat
          </p>
        </div>

        {showWorkoutSelector && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Válassz edzéstervet
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Nincsenek edzéstervek</h3>
                  <p className="mt-2 text-gray-600">
                    Először hozz létre edzésterveket az edzés kezelése oldalon.
                  </p>
                  <button
                    onClick={() => router.push('/training/workouts')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Edzéstervek létrehozása
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workouts.map((workout) => (
                    <div key={workout._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {workout.name}
                          </h3>
                          {workout.description && (
                            <p className="text-gray-600 text-sm mb-3">
                              {workout.description}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <Dumbbell className="w-4 h-4 mr-1" />
                              {workout.exercises.length} gyakorlat
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {workout.estimatedDuration} perc
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => startWorkout(workout)}
                          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Indítás
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isWorkoutActive && selectedWorkout && workoutSession && (
          <div className="space-y-6">
            {/* Workout Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedWorkout.name}</h2>
                  <p className="text-gray-600">Edzés folyamatban...</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{getWorkoutProgress()}%</div>
                  <div className="text-sm text-gray-600">Haladás</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getWorkoutProgress()}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {currentExerciseIndex + 1} / {selectedWorkout.exercises.length} gyakorlat
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={saveProgress}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 shadow-sm text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Haladás mentése
                  </button>
                  <button
                    onClick={finishWorkout}
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Edzés befejezése
                  </button>
                </div>
              </div>
            </div>

            {/* Current Exercise */}
            {getCurrentExercise() && getCurrentExerciseProgress() && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getCurrentExercise()?.exerciseName}
                  </h3>
                  <div className="text-lg text-gray-600 mb-4">
                    {currentSet} / {getCurrentExercise()?.sets} szett
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getCurrentExercise()?.reps}
                      </div>
                      <div className="text-sm text-gray-600">Ismétlés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getCurrentExercise()?.weight || 0} kg
                      </div>
                      <div className="text-sm text-gray-600">Súly</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {getCurrentExercise()?.restTime || 60} mp
                      </div>
                      <div className="text-sm text-gray-600">Pihenés</div>
                    </div>
                  </div>

                  <button
                    onClick={completeSet}
                    className="inline-flex items-center px-8 py-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Szett befejezve
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackerPage;
