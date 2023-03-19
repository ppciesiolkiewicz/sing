import { DifficultyLevel } from "@/constants";


export const signUp = async (values: { email: string; password: string; name?: string; }) => {
  const resp = await fetch(
    '/api/user',
    {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    },
  );

  return resp.json();
}


export const logIn = async (values: { email: string; password: string }) => {
  const resp = await fetch(
    '/api/user/token',
    {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    },
  );

  return resp.json();
}

export const logOut = async () => {
  const resp = await fetch(
    '/api/user/token',
    {
      method: 'DELETE',
    },
  );

  return resp.json();
}


export const updateUser = async (values: {
  lowNote: string;
  highNote: string;
  difficultyLevel: DifficultyLevel,
}) => {
  const resp = await fetch(
    '/api/user/',
    {
      method: 'PATCH',
      body: JSON.stringify({
        lowNote: values.lowNote,
        highNote: values.highNote,
        difficultyLevel: values.difficultyLevel,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    },
  );

  return resp.json();
}