// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import EXERCISES from './data';


type Data = any;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const id = req.query.id as string;
  if (id) {
    res.status(200).json(EXERCISES.find(e => e.id === parseInt(id)))
  }
  res.status(400).json({ error: 'TODO: error handling' })
}
