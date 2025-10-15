import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Plus, Save, Edit3, Trash2, Dumbbell, Clock, Users } from 'lucide-react';
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

const WorkoutsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate',
    exercises: [] as WorkoutExercise[],
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    loadWorkouts();
    loadExercises();
    // Auto-open modal for create or edit
    const { create, edit } = router.query as { create?: string; edit?: string };
    if (create === '1') {
      resetForm();
      setShowModal(true);
    } else if (edit) {
      const w = workouts.find(w => w._id === edit);
      if (w) {
        handleEdit(w);
      }
    }
  }, [session, status, router]);

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

  const loadExercises = async () => {
    try {
      const response = await fetch('/api/training/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty: 'intermediate',
      exercises: [],
    });
    setEditingWorkout(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Az edzésterv neve kötelező');
      return;
    }

    if (formData.exercises.length === 0) {
      toast.error('Legalább egy gyakorlatot hozzá kell adni');
      return;
    }

    try {
      const url = editingWorkout 
        ? `/api/training/workouts?id=${editingWorkout._id}`
        : '/api/training/workouts';
      
      const method = editingWorkout ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingWorkout ? 'Edzésterv frissítve!' : 'Edzésterv létrehozva!');
        setShowModal(false);
        resetForm();
        loadWorkouts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Hiba történt');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Hiba történt a mentéskor');
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setFormData({
      name: workout.name,
      description: workout.description || '',
      difficulty: workout.difficulty,
      exercises: workout.exercises,
    });
    setShowModal(true);
  };

  const handleDelete = async (workoutId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt az edzéstervet?')) {
      return;
    }

    try {
      const response = await fetch(`/api/training/workouts?id=${workoutId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Edzésterv törölve!');
        loadWorkouts();
      } else {
        toast.error('Nem sikerült törölni az edzéstervet');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Hiba történt a törléskor');
    }
  };

  const addExercise = () => {
    if (exercises.length === 0) {
      toast.error('Nincsenek elérhető gyakorlatok. Először hozz létre gyakorlatokat!');
      return;
    }

    const newExercise: WorkoutExercise = {
      exerciseId: exercises[0]._id,
      exerciseName: exercises[0].name,
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
    };

    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => {
        if (i === index) {
          const updatedExercise = { ...exercise, [field]: value };
          // Update exerciseName when exerciseId changes
          if (field === 'exerciseId') {
            const selectedExercise = exercises.find(ex => ex._id === value);
            updatedExercise.exerciseName = selectedExercise?.name || 'Unknown Exercise';
          }
          return updatedExercise;
        }
        return exercise;
      }),
    }));
  };

  const calculateEstimatedDuration = (workoutExercises: WorkoutExercise[]) => {
    return workoutExercises.reduce((total, exercise) => {
      const exerciseTime = exercise.sets * ((exercise.restTime || 60) + 30); // 30 seconds per set
      return total + exerciseTime;
    }, 0);
  };

  const muscleGroupLabels: { [key: string]: string } = {
    'chest': 'Mell',
    'back': 'Hát',
    'shoulders': 'Váll',
    'arms': 'Kar',
    'legs': 'Láb',
    'core': 'Mag',
    'glutes': 'Fenék',
    'full-body': 'Teljes test',
  };

  const difficultyLabels: { [key: string]: string } = {
    'beginner': 'Kezdő',
    'intermediate': 'Középhaladó',
    'advanced': 'Haladó',
  };

  const categoryLabels: { [key: string]: string } = {
    'strength': 'Erőnléti',
    'cardio': 'Kardió',
    'flexibility': 'Rugalmasság',
    'sports': 'Sport',
    'other': 'Egyéb',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edzéstervek</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Hozz létre edzésterveket a meglévő gyakorlataidból
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/training')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Vissza az edzéshez
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Új edzésterv
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-zinc-950 rounded-lg shadow dark:shadow-none dark:border dark:border-zinc-900 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Keresés</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Edzésterv neve..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : workouts.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Nincsenek edzéstervek</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Kezdj el edzésterveket létrehozni a gyakorlataidból.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts
              .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((workout) => (
              <div key={workout._id} className="bg-white dark:bg-zinc-950 rounded-lg shadow-md dark:shadow-none dark:border dark:border-zinc-900 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {workout.name}
                    </h3>
                    {workout.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {workout.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {difficultyLabels[workout.difficulty]}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
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
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => handleEdit(workout)}
                      className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                      title="Szerkesztés"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(workout._id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                      title="Törlés"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {workout.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {exercise.exerciseName} 
                      ({exercise.sets}×{exercise.reps})
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      +{workout.exercises.length - 3} további gyakorlat
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg dark:shadow-none dark:border dark:border-zinc-900 rounded-md bg-white dark:bg-zinc-950">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingWorkout ? 'Edzésterv szerkesztése' : 'Új edzésterv'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                  >
                    <span className="sr-only">Bezárás</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Edzésterv neve *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Felsőtest edzés"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leírás
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Edzésterv leírása..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nehézség
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Kezdő</option>
                      <option value="intermediate">Középhaladó</option>
                      <option value="advanced">Haladó</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Gyakorlatok
                      </label>
                      <button
                        type="button"
                        onClick={addExercise}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Gyakorlat hozzáadása
                      </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.exercises.map((exercise, index) => (
                        <div key={index} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <select
                              value={exercise.exerciseId}
                              onChange={(e) => updateExercise(index, 'exerciseId', e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {exercises.map((ex) => (
                                <option key={ex._id} value={ex._id}>
                                  {ex.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeExercise(index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Szettek</label>
                              <input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ismétlések</label>
                              <input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Súly (kg)</label>
                              <input
                                type="number"
                                value={exercise.weight}
                                onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Pihenés (mp)</label>
                              <input
                                type="number"
                                value={exercise.restTime || 60}
                                onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-900 dark:bg-black"
                    >
                      Mégse
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      {editingWorkout ? 'Frissítés' : 'Létrehozás'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkoutsPage;
