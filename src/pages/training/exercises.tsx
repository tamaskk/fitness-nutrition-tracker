import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Plus, Edit3, Trash2, Dumbbell, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Exercise {
  _id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  description?: string;
  equipment?: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

const ExercisesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    loadExercises();
    // Auto-open modal for create or edit
    const { create, edit } = router.query as { create?: string; edit?: string };
    if (create === '1') {
      setEditingExercise(null);
      resetForm();
      setShowAddModal(true);
    } else if (edit) {
      const existing = exercises.find(e => e._id === edit);
      if (existing) {
        handleEdit(existing);
      }
    }
  }, [session, status, router]);

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

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      category: exercise.category,
      muscleGroups: exercise.muscleGroups,
      description: exercise.description || '',
      equipment: exercise.equipment || '',
      difficulty: exercise.difficulty,
      instructions: [],
      reps: (exercise as any).reps || 10,
      sets: (exercise as any).sets || 3,
      weight: (exercise as any).weight || 0,
      rest: (exercise as any).rest || 60,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (exerciseId: string) => {
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

  const toggleMuscleGroup = (muscleGroup: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscleGroup)
        ? prev.muscleGroups.filter(mg => mg !== muscleGroup)
        : [...prev.muscleGroups, muscleGroup]
    }));
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || exercise.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gyakorlatok</h1>
            <p className="text-gray-600">Gyakorlatok kezelése és szerkesztése</p>
          </div>
          <button
            onClick={() => {
              setEditingExercise(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Új gyakorlat
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keresés
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Gyakorlat neve..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategória
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nincsenek gyakorlatok</h3>
            <p className="mt-2 text-gray-600">Kezdj el gyakorlatokat hozzáadni az edzéshez.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <div key={exercise._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {exercise.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {categories.find(c => c.value === exercise.category)?.label}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {difficultyLabels[exercise.difficulty]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {exercise.muscleGroups.map((muscleGroup) => (
                          <span
                            key={muscleGroup}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
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
                        <span>{(exercise as any).sets || 3} szett</span>
                        <span>{(exercise as any).reps || 10} ismétlés</span>
                        {(exercise as any).weight > 0 && (
                          <span>{(exercise as any).weight} kg</span>
                        )}
                        <span>{(exercise as any).rest || 60} mp pihenés</span>
                      </div>
                      {exercise.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                      title="Szerkesztés"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exercise._id)}
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

        {/* Add/Edit Modal */}
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
      </div>
    </Layout>
  );
};

export default ExercisesPage;
