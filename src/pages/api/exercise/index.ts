// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import EXERCISES from './data';


type Data = any;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('DATA:', EXERCISES);
  res.status(200).json(EXERCISES)
}
