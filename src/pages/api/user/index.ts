// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { requiresAuthenticationHandler, hashPassword } from '@/lib-api/utils';
import { PrismaClient } from '@prisma/client'

type Data = any;


async function getUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return res.status(200).json(req.user);
}

async function updateUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const prisma = new PrismaClient()
  await prisma.$connect()
  const updateUser = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      highNote: req.body.highNote,
      lowNote: req.body.lowNote,
    },
  })
  return res.status(200).json(updateUser);
}


async function createUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const prisma = new PrismaClient()
  await prisma.$connect()
  const { email, password, name }: { email: string, password: string, name: string }  = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
    }
  })
  console.log(user)
  return res.status(200).json(user);
}


export default async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  if (req.method === 'GET') {
    return requiresAuthenticationHandler(req, res, getUserHandler);
  }

  if (req.method === 'PATCH') {
    return requiresAuthenticationHandler(req, res, updateUserHandler);
  }

  if (req.method === 'POST') {
    return createUserHandler(req, res);
  }

  return res.status(404).json({});
}
