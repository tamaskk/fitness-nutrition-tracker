import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Search, Trash2 } from 'lucide-react';
import { WorkoutFormData, Exercise } from '@/types';
import { getCurrentDateString } from '@/utils/dateUtils';
import { calculateWorkoutCalories, getExerciseTypeColor } from '@/utils/calculations';

interface WorkoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkoutFormData & { date: string; notes?: string }) => void;
  initialDate?: string;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialDate = getCurrentDateString()
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<WorkoutFormData & { date: string; notes?: string }>({
    defaultValues: {
      date: initialDate,
      exercises: [
        {
          name: '',
          sets: 3,
          reps: 10,
          durationSeconds: 0,
          weightKg: 0,
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  });

  const watchedExercises = watch('exercises');

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleExerciseSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/exercises?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Exercise search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExercise = (exercise: Exercise, index: number) => {
    // Update the form field with selected exercise
    const updatedExercises = [...watchedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      name: exercise.name,
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultReps || 10,
    };
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  const calculateExerciseCalories = (exerciseData: any, index: number) => {
    const selectedExercise = exercises.find(ex => ex.name === exerciseData.name);
    if (!selectedExercise) return 0;

    return calculateWorkoutCalories(
      selectedExercise,
      exerciseData.sets || 0,
      exerciseData.reps || 0,
      exerciseData.durationSeconds || 0,
      exerciseData.weightKg || 0
    );
  };

  const getTotalCalories = () => {
    return watchedExercises.reduce((total, exerciseData, index) => {
      return total + calculateExerciseCalories(exerciseData, index);
    }, 0);
  };

  const handleClose = () => {
    reset();
    setSearchResults([]);
    setSearchQuery('');
    onClose();
  };

  const onFormSubmit = (data: WorkoutFormData & { date: string; notes?: string }) => {
    // Calculate calories for each exercise
    const exercisesWithCalories = data.exercises.map((exerciseData, index) => ({
      ...exerciseData,
      caloriesBurned: calculateExerciseCalories(exerciseData, index),
    }));

    onSubmit({
      ...data,
      exercises: exercisesWithCalories,
    });
    
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Edzés rögzítése</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dátum
                </label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Exercise Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gyakorlatok keresése
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Gyakorlatok keresése..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleExerciseSearch())}
                  />
                  <button
                    type="button"
                    onClick={handleExerciseSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((exercise) => (
                      <div key={exercise._id} className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-sm text-gray-600">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs mr-2 ${getExerciseTypeColor(exercise.type)}`}>
                                {exercise.type}
                              </span>
                              {exercise.muscleGroups?.join(', ')}
                            </div>
                          </div>
                          <select
                            onChange={(e) => {
                              const index = parseInt(e.target.value);
                              if (index >= 0) {
                                handleSelectExercise(exercise, index);
                              }
                            }}
                            className="ml-3 px-2 py-1 border border-gray-300 rounded text-sm"
                            defaultValue=""
                          >
                            <option value="">Add to...</option>
                            {fields.map((_, index) => (
                              <option key={index} value={index}>
                                Exercise {index + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exercises */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Exercises
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ name: '', sets: 3, reps: 10, durationSeconds: 0, weightKg: 0 })}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Gyakorlat hozzáadása
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Exercise {index + 1}</h4>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Exercise Name */}
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gyakorlat neve
                          </label>
                          <input
                            {...register(`exercises.${index}.name`, { required: 'Exercise name is required' })}
                            type="text"
                            placeholder="Add meg a gyakorlat nevét"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.exercises?.[index]?.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.exercises[index]?.name?.message}</p>
                          )}
                        </div>

                        {/* Sets */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sorozatok
                          </label>
                          <input
                            {...register(`exercises.${index}.sets`, { required: 'Sets is required', min: 1 })}
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Reps */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ismétlések
                          </label>
                          <input
                            {...register(`exercises.${index}.reps`)}
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Weight */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Súly (kg)
                          </label>
                          <input
                            {...register(`exercises.${index}.weightKg`)}
                            type="number"
                            min="0"
                            step="0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Duration (for cardio exercises) */}
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Időtartam (másodperc) - kardió gyakorlatokhoz
                        </label>
                        <input
                          {...register(`exercises.${index}.durationSeconds`)}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Estimated calories */}
                      <div className="mt-2 text-sm text-gray-600">
                        Estimated calories: {calculateExerciseCalories(watchedExercises[index], index)} cal
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Megjegyzések (opcionális)
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Adj hozzá megjegyzéseket az edzésedről..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total Calories */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-lg font-medium text-blue-900">
                  Összes becsült kalória: {getTotalCalories()} kal
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edzés rögzítése
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutForm;

