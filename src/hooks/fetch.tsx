import useSWR from 'swr';


export function useFetchExercises() {
  const query = useSWR('/api/exercises', (url) => {
    return fetch(url).then((res) => res.json())
  });

  return query;
}

export function useFetchExercise({ id }: { id: string | number }) {
  const query = useSWR(`/api/exercises/${id}`, (url) => {
    return fetch(url).then((res) => res.json())
  });

  return query;
}