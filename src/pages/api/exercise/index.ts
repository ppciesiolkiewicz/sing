// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { MiddlewareBuilder, ServerError } from '@/lib-api/utils';
import { getScaleExercises, getIntervalExercises, getSongExercises } from './exerciseData';


type Data = any;

function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const exercises = [
      ...getScaleExercises(req.user.lowNote, req.user.highNote),
      ...getIntervalExercises(req.user.lowNote, req.user.highNote),
      ...getSongExercises(),
    ];
    return res.status(200).json(exercises)
  }

  return res.status(404).json({});
};

export default new MiddlewareBuilder(
  handler,
).buildAuthenticatedMiddleware();
