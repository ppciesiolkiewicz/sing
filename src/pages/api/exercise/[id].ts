// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { MiddlewareBuilder, ServerError } from '@/lib-api/utils';
import EXERCISES from './data';


type Data = any;


function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const id = req.query.id as string;
  if (id) {
    const exercise = EXERCISES.find(e => e.id === parseInt(id));
    if (!exercise) {
      return res.status(404).json({});
    }

    exercise.config.lowestNoteName = req.user.lowNote;
    exercise.config.highestNoteName = req.user.highNote;
    return res.status(200).json(exercise)
  }
  throw new ServerError('Exercise not found', 404);
}


export default new MiddlewareBuilder(
  handler,
).buildAuthenticatedMiddleware();
