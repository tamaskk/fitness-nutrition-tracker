import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Dumbbell, Save } from 'lucide-react';

interface MuscleGroup {
  id: number;
  name: string;
  type: string;
}

interface ExerciseItem {
  id: number;
  name: string;
  branded_video: string | null;
  reps: number | null;
  sets: number | null;
  rest_time: number | null;
  weight: number | null;
}

interface Exercise {
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

const muscleGroups: MuscleGroup[] = [
  { id: 47, name: 'Váll', type: 'shoulder' },
  { id: 4, name: 'Nyak', type: 'neck' },
  { id: 1, name: 'Bicepsz', type: 'biceps' },
  { id: 10, name: 'Alkar', type: 'forearm' },
  { id: 43, name: 'Kéz', type: 'hand' },
  { id: 15, name: 'Oldal', type: 'side' },
  { id: 12, name: 'Has', type: 'back' },
  { id: 3, name: 'Comb', type: 'chest' },
  { id: 11, name: 'Alsó láb', type: 'leg' },
  { id: 5, name: 'Tricepsz', type: 'triceps' },
  { id: 14, name: 'Hát felső', type: 'back' },
  { id: 7, name: 'Hát oldal', type: 'back' },
  { id: 13, name: 'Hát alsó', type: 'back' },
  { id: 8, name: 'Fenék', type: 'glutes' },
];

const categories = [
  { id: 2, name: 'Súlyzós edzés' },
  { id: 4, name: 'Gépes edzés' },
  { id: 7, name: 'Kettlebell' },
  { id: 9, name: 'Kábel' },
  { id: 11, name: 'Tárcsás' },
  { id: 85, name: 'Smith gép' },
  { id: 1, name: 'Barbell' },
  { id: 3, name: 'Testtömeg' },
  { id: 27, name: 'Kardió' },
];

const MuscleWikiExercises: React.FC = () => {
  const [limit, setLimit] = useState<number | null>(4);
  const [offset, setOffset] = useState<number | null>(0);
  const [category, setCategory] = useState<number | null>(null);
  const [muscles, setMuscles] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        limit: limit?.toString() || '4',
        offset: offset?.toString() || '0',
        category: category?.toString() || '',
        status: 'Published',
        ordering: '-featured_weight',
        muscles: muscles.toString(),
      });

      const response = await fetch(`/api/musclewiki?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`Hiba: ${response.statusText}`);

      const data = await response.json();
      const exercisesWithLinks: ExerciseItem[] = data.results.map((ex: any) => ({
        id: ex.id || 0,
        name: ex.name || 'Névtelen gyakorlat',
        branded_video: ex?.male_images?.[0]?.branded_video || null,
        reps: null,
        sets: null,
        rest_time: null,
        weight: null,
      }));

      setExercises(exercisesWithLinks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveExercise = async (exerciseItem: ExerciseItem) => {
    console.log(exerciseItem)
    if (!exerciseItem.reps || !exerciseItem.sets || !exerciseItem.weight || !exerciseItem.rest_time) {
      toast.error('Minden mezőt ki kell tölteni');
      return;
    }

    console.log(exerciseItem);

    const foundMuscle = muscleGroups.find((mus) => mus.id === muscles)?.type;
    const foundCategory = categories.find((cat) => cat.id === category)?.name;
    console.log(categories)
    console.log(category)

    const newExerciseItem: Exercise = {
      category: 'other',
      difficulty: 'beginner',
      muscleGroups: foundMuscle ? [foundMuscle] : [],
      name: exerciseItem.name,
      description: '',
      equipment: '',
      image: exerciseItem.branded_video ?? '',
      reps: exerciseItem.reps,
      rest: exerciseItem.rest_time,
      sets: exerciseItem.sets,
      weight: exerciseItem.weight,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString()
    };
    
    try {
      const response = await fetch('/api/training/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExerciseItem),
      });    

      if (response.ok) {
        toast.success('Edzés mentve');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Nem sikerült a mentés');
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Hálózati hiba történt. Kérjük, próbáld újra.');
    }

  };

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <div className="bg-white dark:bg-zinc-950 shadow-md dark:shadow-none rounded-2xl p-6 border border-gray-100 dark:border-zinc-900">
        <div className="flex items-center gap-3 mb-6">
          <Dumbbell className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">MuscleWiki Edzéskereső</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Eredmények száma</label>
            <input
              type="number"
              value={limit ?? ''}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full border border-gray-300 p-2.5 rounded-md mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              min={1}
              max={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Keresés előzményeinek száma</label>
            <input
              type="number"
              value={offset ?? ''}
              onChange={(e) => setOffset(Number(e.target.value))}
              className="w-full border border-gray-300 p-2.5 rounded-md mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              min={0}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Kategória</label>
            <select
              value={category ?? ''}
              onChange={(e) => setCategory(Number(e.target.value))}
              className="w-full border border-gray-300 p-2.5 rounded-md mt-1 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
            >
              <option value="">Összes</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Izomcsoport</label>
            <select
              value={muscles}
              onChange={(e) => setMuscles(Number(e.target.value))}
              className="w-full border border-gray-300 p-2.5 rounded-md mt-1 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
            >
              {muscleGroups.map((muscle) => (
                <option key={muscle.id} value={muscle.id}>{muscle.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchExercises}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" /> Edzések keresése
        </button>
      </div>

      {/* Results */}
      <div className="mt-8 space-y-5">
        {loading && <p className="text-center text-gray-600">Betöltés...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && exercises.length === 0 && <p className="text-center text-gray-500">Nincs találat.</p>}

        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-zinc-900 p-5">
            <div className="flex items-center justify-between mb-3">
              {/* <h3 className="text-lg font-semibold text-gray-800">{exercise.name}</h3> */}
              <input
                className="border border-gray-300 p-2 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Név"
                type="text"
                value={exercise.name}
                onChange={(e) => setExercises((prev) => prev.map((ex) => (ex.id === exercise.id ? { ...ex, name: e.target.value } : ex)))}
              />
              <button
                onClick={() => saveExercise(exercise)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Mentés
              </button>
            </div>

            {exercise.branded_video && (
              <div className="rounded-lg overflow-hidden mb-4 aspect-video">
                <video
                  src={exercise.branded_video}
                  playsInline
                  autoPlay
                  muted
                  loop
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                className="border border-gray-300 p-2 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ismétlés"
                type="number"
                value={exercise.reps ?? ''}
                onChange={(e) =>
                  setExercises((prev) =>
                    prev.map((ex) => (ex.id === exercise.id ? { ...ex, reps: Number(e.target.value) } : ex))
                  )
                }
              />
              <input
                className="border border-gray-300 p-2 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Sorozat"
                type="number"
                value={exercise.sets ?? ''}
                onChange={(e) =>
                  setExercises((prev) =>
                    prev.map((ex) => (ex.id === exercise.id ? { ...ex, sets: Number(e.target.value) } : ex))
                  )
                }
              />
              <input
                className="border border-gray-300 p-2 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Pihenő (mp)"
                type="number"
                value={exercise.rest_time ?? ''}
                onChange={(e) =>
                  setExercises((prev) =>
                    prev.map((ex) => (ex.id === exercise.id ? { ...ex, rest_time: Number(e.target.value) } : ex))
                  )
                }
              />
              <input
                className="border border-gray-300 p-2 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Súly (kg)"
                type="number"
                value={exercise.weight ?? ''}
                onChange={(e) =>
                  setExercises((prev) =>
                    prev.map((ex) => (ex.id === exercise.id ? { ...ex, weight: Number(e.target.value) } : ex))
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MuscleWikiExercises;
