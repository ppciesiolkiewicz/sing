// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { MiddlewareBuilder, ServerError } from '@/lib-api/utils';
import EXERCISES from './data';


type Data = any;

function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    return res.status(200).json(EXERCISES)
  }

  return res.status(404).json({});
};

export default new MiddlewareBuilder(
  handler,
).buildAuthenticatedMiddleware();
