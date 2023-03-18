import useSWR from 'swr';


export function useFetchUser() {
  const query = useSWR('/api/user', (url: string) => {
    return fetch(url).then((res) => res.json())
  });

  return query;
}



export function useFetchExercises() {
  const query = useSWR('/api/exercise', (url: string) => {
    return fetch(url).then((res) => res.json())
  });

  return query;
}

export function useFetchExercise({ id }: { id: string | number }) {
  const query = useSWR(`/api/exercise/${id}`, (url: string) => {
    return fetch(url).then((res) => res.json())
  });

  return query;
}