// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie, deleteCookie, Jwt, hashPassword } from '@/lib-api/utils';
import { PrismaClient } from '@prisma/client'

type Data = any;


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const prisma = new PrismaClient()
  await prisma.$connect()

  if (req.method === 'POST') {
    const { email, password } = req.body;
    const user = prisma.user.findUnique({
      where: {
        email,
        passwordHash: hashPassword(password),
      }
    });
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
    const user = prisma.user.findUnique({
      where: {
        id: decoded.userId,
      }
    });
    const token = Jwt.sign(decoded.userId)

    setCookie(res, 'token', token);
    return res.status(200).json({});
  }

  if (req.method === 'DELETE') {
    deleteCookie(res, 'token');
    return res.status(200).json({});
  }

  return res.status(404).json({});
}
