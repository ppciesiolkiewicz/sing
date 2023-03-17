// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import usersData from './usersData';
import { requiresAuthenticationHandler } from '@/lib-api/utils';


type Data = any;


export default (
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) => 
  requiresAuthenticationHandler(
  req,
  res,
  (
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) => {
    if (req.method === 'GET') {
      return res.status(200).json(req.user);
    }

    if (req.method === 'PATCH') {
      // TODO: update
      return res.status(200).json(req.user);
    }

    return res.status(404).json({});
  }
)
