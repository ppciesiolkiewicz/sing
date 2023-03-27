// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { MiddlewareBuilder, ServerError } from '@/lib-api/utils';
import { getScaleExercises, getIntervalExercises } from './exerciseData';

type Data = any;

function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const id = req.query.id as string;
  if (id) {
    const exercises = [
      ...getScaleExercises(req.user.lowNote, req.user.highNote),
      ...getIntervalExercises(req.user.lowNote, req.user.highNote),
    ];
    const exercise = exercises.find(e => e.id === id);
    if (!exercise) {
      return res.status(404).json({});
    }

    return res.status(200).json(exercise)
  }
  throw new ServerError('Exercise not found', 404);
}


export default new MiddlewareBuilder(
  handler,
).buildAuthenticatedMiddleware();
