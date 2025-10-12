import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ArrowLeft, Calendar, Clock, Dumbbell, CheckCircle, PauseCircle, PlayCircle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

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
  _id: string;
  workoutId: string;
  workoutName: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  exercises: CompletedExercise[];
  totalCaloriesBurned?: number;
  notes?: string;
  status: 'in-progress' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

const HistoryPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    loadSessions();
  }, [session, status, router]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-yellow-500" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Befejezve';
      case 'paused':
        return 'Szüneteltetve';
      case 'in-progress':
        return 'Folyamatban';
      default:
        return 'Ismeretlen';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalSets = (exercises: CompletedExercise[]) => {
    return exercises.reduce((total, exercise) => total + exercise.totalSets, 0);
  };

  const calculateCompletedSets = (exercises: CompletedExercise[]) => {
    return exercises.reduce((total, exercise) => total + exercise.completedSets, 0);
  };

  const getProgressPercentage = (exercises: CompletedExercise[]) => {
    const total = calculateTotalSets(exercises);
    const completed = calculateCompletedSets(exercises);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Edzés történet</h1>
          <p className="mt-2 text-gray-600">
            Tekintsd meg az előző edzéseidet és a haladásodat
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nincs edzés történet</h3>
            <p className="mt-2 text-gray-600">
              Még nem fejeztél be egyetlen edzést sem. Kezdj el edzeni!
            </p>
            <button
              onClick={() => router.push('/training/tracker')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Edzés indítása
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sessions List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Edzés munkamenetek</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <div key={session._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.workoutName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}
                            <span className="ml-1">{getStatusText(session.status)}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(session.startTime)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {session.duration ? `${session.duration} perc` : 'Ismeretlen'}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Dumbbell className="w-4 h-4 mr-2" />
                            {session.exercises.length} gyakorlat
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {getProgressPercentage(session.exercises)}% teljesítve
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(session.exercises)}%` }}
                          ></div>
                        </div>

                        <div className="text-sm text-gray-600">
                          {calculateCompletedSets(session.exercises)} / {calculateTotalSets(session.exercises)} szett befejezve
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setShowDetails(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Részletek
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Session Details Modal */}
        {showDetails && selectedSession && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedSession.workoutName} - Részletek
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedSession(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Bezárás</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kezdés ideje</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedSession.startTime)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Időtartam</label>
                      <p className="text-sm text-gray-900">{selectedSession.duration ? `${selectedSession.duration} perc` : 'Ismeretlen'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Státusz</label>
                      <p className="text-sm text-gray-900">{getStatusText(selectedSession.status)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Haladás</label>
                      <p className="text-sm text-gray-900">{getProgressPercentage(selectedSession.exercises)}%</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gyakorlatok</label>
                    <div className="space-y-3">
                      {selectedSession.exercises.map((exercise, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{exercise.exerciseName}</h4>
                            <span className="text-sm text-gray-600">
                              {exercise.completedSets} / {exercise.totalSets} szett
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(exercise.completedSets / exercise.totalSets) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {exercise.sets.map((set, setIndex) => (
                              <span key={setIndex} className={`inline-block mr-2 px-2 py-1 rounded text-xs ${
                                set.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {set.setNumber}. szett: {set.reps} ismétlés {set.weight ? `(${set.weight} kg)` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedSession.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Megjegyzések</label>
                      <p className="text-sm text-gray-900">{selectedSession.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedSession(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Bezárás
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;




