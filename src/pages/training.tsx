import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Dumbbell, Plus, List, Play, BarChart3, Edit3, Trash2, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import MuscleWikiExercises from '@/components/MuscleWikiExercises';

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
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const TrainingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'exercises' | 'workouts' | 'tracker' | 'history' | 'musclewiki'>('exercises');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchedExercises, setSearchedExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [searchedWorkouts, setSearchedWorkouts] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'strength',
    muscleGroups: [] as string[],
    description: '',
    equipment: '',
    difficulty: 'beginner',
    instructions: [] as string[],
    reps: 10,
    sets: 3,
    weight: 0,
    rest: 60,
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (activeTab === 'exercises') {
      loadExercises();
    } else if (activeTab === 'workouts') {
      loadWorkouts();
    } else if (activeTab === 'tracker') {
      loadActiveSessions();
    } else if (activeTab === 'history') {
      loadSessions();
    }
  }, [session, status, router, activeTab]);

  // Refresh active sessions when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'tracker') {
        loadActiveSessions();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      } else {
        toast.error('Nem sikerült betölteni a gyakorlatokat');
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Hiba történt a gyakorlatok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

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

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        toast.error('Nem sikerült betölteni az edzés történetet');
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Hiba történt az edzés történet betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training/sessions');
      if (response.ok) {
        const data = await response.json();
        
        // Clean up duplicate sessions (keep the most recent one for each workout)
        const uniqueSessions = new Map();
        data.forEach((session: any) => {
          const key = `${session.workoutId}_${session.status}`;
          if (!uniqueSessions.has(key) || new Date(session.createdAt) > new Date(uniqueSessions.get(key).createdAt)) {
            uniqueSessions.set(key, session);
          }
        });
        
        const cleanedData = Array.from(uniqueSessions.values());
        
        // Filter for active sessions (processing, in-progress, or paused)
        const active = cleanedData.filter((session: any) => 
          session.status === 'processing' || 
          session.status === 'in-progress' || 
          session.status === 'paused'
        );
        setActiveSessions(active);
      } else {
        toast.error('Nem sikerült betölteni az aktív edzéseket');
      }
    } catch (error) {
      console.error('Error loading active sessions:', error);
      toast.error('Hiba történt az aktív edzések betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a gyakorlatot?')) {
      return;
    }

    try {
      const response = await fetch(`/api/training/exercises?id=${exerciseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Gyakorlat törölve!');
        loadExercises();
      } else {
        toast.error('Nem sikerült törölni a gyakorlatot');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Hiba történt a törléskor');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('A gyakorlat neve kötelező');
      return;
    }

    try {
      const url = editingExercise ? `/api/training/exercises?id=${editingExercise._id}` : '/api/training/exercises';
      const method = editingExercise ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingExercise ? 'Gyakorlat frissítve!' : 'Gyakorlat hozzáadva!');
        setShowAddModal(false);
        setEditingExercise(null);
        resetForm();
        loadExercises();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Hiba történt');
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Hiba történt a mentéskor');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filteredExercises = exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchedExercises(filteredExercises);
    const filteredWorkouts = workouts.filter(workout => 
      workout.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchedWorkouts(filteredWorkouts);
  };

  const toggleMuscleGroup = (muscleGroup: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscleGroup)
        ? prev.muscleGroups.filter(mg => mg !== muscleGroup)
        : [...prev.muscleGroups, muscleGroup]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'strength',
      muscleGroups: [],
      description: '',
      equipment: '',
      difficulty: 'beginner',
      instructions: [],
      reps: 10,
      sets: 3,
      weight: 0,
      rest: 60,
    });
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
    router.push('/login');
    return null;
  }

  const tabs = [
    {
      id: 'exercises' as const,
      name: 'Gyakorlatok',
      icon: Dumbbell,
      description: 'Gyakorlatok kezelése'
    },
    {
      id: 'workouts' as const,
      name: 'Edzéstervek',
      icon: List,
      description: 'Edzéstervek létrehozása'
    },
    {
      id: 'tracker' as const,
      name: 'Edzés követése',
      icon: Play,
      description: 'Aktív edzés követése'
    },
    {
      id: 'history' as const,
      name: 'Edzés történet',
      icon: BarChart3,
      description: 'Előző edzések megtekintése'
    },
    {
      id: 'musclewiki' as const,
      name: 'MuscleWiki',
      icon: Dumbbell,
      description: 'Gyakorlatok keresése MuscleWiki-n'
    }
  ];

  const categories = [
    { value: '', label: 'Összes kategória' },
    { value: 'strength', label: 'Erőnléti' },
    { value: 'cardio', label: 'Kardió' },
    { value: 'flexibility', label: 'Rugalmasság' },
    { value: 'sports', label: 'Sport' },
    { value: 'other', label: 'Egyéb' },
  ];

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'full-body'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edzés</h1>
            <p className="text-gray-600">Edzések kezelése és követése</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm('');
                    setSearchedExercises([]);
                    setSearchedWorkouts([]);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <input type="text" placeholder="Keresés" value={searchTerm} onChange={handleSearch} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'exercises' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Gyakorlatok</h3>
                  <button
                    onClick={() => {
                      setEditingExercise(null);
                      resetForm();
                      setShowAddModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Új gyakorlat
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Itt kezelheted a gyakorlataidat. Hozzáadhatsz új gyakorlatokat, módosíthatod a meglévőket, vagy törölheted őket.
                </p>

                {/* Exercises List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : exercises.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-4 text-lg font-medium text-gray-900">Nincsenek gyakorlatok</h4>
                    <p className="mt-2 text-gray-600">Kezdj el gyakorlatokat hozzáadni az edzéshez.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(searchTerm ? searchedExercises : exercises).map((exercise) => (
                      <div key={exercise._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {exercise.name}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {categoryLabels[exercise.category]}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {difficultyLabels[exercise.difficulty]}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {exercise.muscleGroups.map((muscleGroup: string) => (
                                  <span
                                    key={muscleGroup}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800"
                                  >
                                    {muscleGroupLabels[muscleGroup]}
                                  </span>
                                ))}
                              </div>
                              {exercise.equipment && (
                                <p className="text-sm text-gray-600">
                                  Felszerelés: {exercise.equipment}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                <span>{exercise.sets || 3} szett</span>
                                <span>{exercise.reps || 10} ismétlés</span>
                                {exercise.weight && exercise.weight > 0 && (
                                  <span>{exercise.weight} kg</span>
                                )}
                                <span>{exercise.rest || 60} mp pihenés</span>
                              </div>
                              {exercise.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {exercise.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <button
                              onClick={() => router.push(`/training/exercises?edit=${exercise._id}`)}
                              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                              title="Szerkesztés"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExercise(exercise._id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                              title="Törlés"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edzéstervek</h3>
                  <button
                    onClick={() => router.push('/training/workouts?create=1')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Új edzésterv
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Itt hozhatsz létre edzésterveket a meglévő gyakorlataidból. Kombinálhatod a gyakorlatokat egy teljes edzésbe.
                </p>

                {/* Workouts List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : workouts.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-4 text-lg font-medium text-gray-900">Nincsenek edzéstervek</h4>
                    <p className="mt-2 text-gray-600">Kezdj el edzésterveket létrehozni a gyakorlataidból.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(searchTerm ? searchedWorkouts : workouts).map((workout) => (
                      <div key={workout._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {workout.name}
                            </h4>
                            {workout.description && (
                              <p className="text-gray-600 text-sm mb-3">
                                {workout.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {difficultyLabels[workout.difficulty]}
                              </span>
                            </div>
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
                            <div className="mt-3 space-y-1">
                              {workout.exercises.slice(0, 2).map((exercise: any, index: number) => (
                                <div key={index} className="text-sm text-gray-600">
                                  • {exercise.exerciseName} ({exercise.sets}×{exercise.reps})
                                </div>
                              ))}
                              {workout.exercises.length > 2 && (
                                <div className="text-sm text-gray-500">
                                  +{workout.exercises.length - 2} további gyakorlat
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <button
                              onClick={() => router.push(`/training/workouts?edit=${workout._id}`)}
                              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                              title="Szerkesztés"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWorkout(workout._id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                              title="Törlés"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edzés követése</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={loadActiveSessions}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Frissítés
                    </button>
                    <button
                      onClick={() => router.push('/training/tracker')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Új edzés indítása
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Itt indíthatod el az edzéseidet és követheted a haladásodat. Jelölheted be a befejezett szetteket és nyomon követheted az időt.
                </p>

                {/* Active Sessions List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : activeSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Play className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-4 text-lg font-medium text-gray-900">Nincsenek aktív edzések</h4>
                    <p className="mt-2 text-gray-600">Indíts el egy új edzést vagy folytasd a mentett haladást.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {session.workoutName}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(session.startTime).toLocaleDateString('hu-HU')}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {session.duration ? `${session.duration} perc` : 'Folyamatban'}
                              </div>
                              <div className="flex items-center">
                                <Dumbbell className="w-4 h-4 mr-1" />
                                {session.exercises.length} gyakorlat
                              </div>
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  session.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                                  session.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                  session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {session.status === 'processing' ? 'Feldolgozás' :
                                   session.status === 'in-progress' ? 'Folyamatban' :
                                   session.status === 'paused' ? 'Szüneteltetve' :
                                   session.status === 'completed' ? 'Befejezve' : 'Sikertelen'}
                                </span>
                              </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${Math.round((session.exercises.reduce((total: number, ex: any) => total + ex.completedSets, 0) / session.exercises.reduce((total: number, ex: any) => total + ex.totalSets, 0)) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {session.exercises.reduce((total: number, ex: any) => total + ex.completedSets, 0)} / {session.exercises.reduce((total: number, ex: any) => total + ex.totalSets, 0)} szett befejezve
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <button
                              onClick={() => router.push(`/training/tracker?session=${session._id}`)}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Folytatás
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edzés történet</h3>
                  <button
                    onClick={() => router.push('/training/history')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Teljes történet
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Itt tekintheted meg az előző edzéseidet, a teljesítményedet és a haladásodat az idő múlásával.
                </p>

                {/* Sessions List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-4 text-lg font-medium text-gray-900">Nincs edzés történet</h4>
                    <p className="mt-2 text-gray-600">Még nem fejeztél be egyetlen edzést sem.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {session.workoutName}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(session.startTime).toLocaleDateString('hu-HU')}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {session.duration ? `${session.duration} perc` : 'Ismeretlen'}
                              </div>
                              <div className="flex items-center">
                                <Dumbbell className="w-4 h-4 mr-1" />
                                {session.exercises.length} gyakorlat
                              </div>
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {session.status === 'completed' ? 'Befejezve' :
                                   session.status === 'paused' ? 'Szüneteltetve' : 'Folyamatban'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push('/training/history')}
                            className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Részletek
                          </button>
                        </div>
                      </div>
                    ))}
                    {sessions.length > 5 && (
                      <div className="text-center">
                        <button
                          onClick={() => router.push('/training/history')}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          +{sessions.length - 5} további edzés megtekintése
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowAddModal(false)} />
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingExercise ? 'Gyakorlat szerkesztése' : 'Új gyakorlat hozzáadása'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gyakorlat neve *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategória *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {categories.filter(c => c.value).map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nehézség *
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="beginner">Kezdő</option>
                          <option value="intermediate">Középhaladó</option>
                          <option value="advanced">Haladó</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Izomcsoportok *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {muscleGroups.map((muscleGroup) => (
                          <label key={muscleGroup} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.muscleGroups.includes(muscleGroup)}
                              onChange={() => toggleMuscleGroup(muscleGroup)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {muscleGroupLabels[muscleGroup]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Felszerelés
                      </label>
                      <input
                        type="text"
                        value={formData.equipment}
                        onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                        placeholder="pl. súlyzó, gép, saját testsúly"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ismétlések
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.reps}
                          onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Szettek
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.sets}
                          onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Súly (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pihenés (mp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.rest}
                          onChange={(e) => setFormData({ ...formData, rest: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Leírás
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Rövid leírás a gyakorlatról..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Mégse
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {editingExercise ? 'Frissítés' : 'Hozzáadás'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'musclewiki' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">MuscleWiki kereső</h3>
              <MuscleWikiExercises />
            </div>
          </div>
        )}
    </Layout>
  );
};

export default TrainingPage;
