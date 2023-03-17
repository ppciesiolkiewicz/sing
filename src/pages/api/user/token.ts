// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import usersData from './usersData';
import { setCookie, deleteCookie, Jwt } from '@/lib-api/utils';

type Data = any;


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    const user = usersData.find(u => u.email === email && u.password === password);
    if (user) {
      const token = Jwt.sign(user.id)
      setCookie(res, 'token', token);

      return res.status(200).json({});
    }

    return res.status(404).json({});
  }

  if (req.method === 'GET') {
    const decoded = Jwt.verify(req.cookies.token);
    console.log('decoded', decoded)
    const user = usersData[0];
    const token = Jwt.sign(user.id)

    setCookie(res, 'token', token);
    return res.status(200).json({});
  }

  if (req.method === 'DELETE') {
    deleteCookie(res, 'token');
    return res.status(200).json({});
  }

  return res.status(404).json({});
}
