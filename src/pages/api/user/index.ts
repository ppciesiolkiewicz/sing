// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { hashPassword } from '@/lib-api/utils';
import { MiddlewareBuilder, ServerError } from '@/lib-api/utils';


type Data = any;


async function getUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('user.COOKIES:', req.cookies)
  return res.status(200).json(req.user);
}

async function updateUserHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const updateUser = await req.prisma.user.update({
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
  const { email, password, name }: { email: string, password: string, name: string }  = req.body;
  const passwordHash = hashPassword(password);

  const user = await req.prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      lowNote: 'C3',
      highNote: 'D4',
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
    return new MiddlewareBuilder(
      getUserHandler,
    ).buildAuthenticatedMiddleware()(req, res);
  }

  if (req.method === 'PATCH') {
    return new MiddlewareBuilder(
      updateUserHandler,
    ).buildAuthenticatedMiddleware()(req, res);
  }

  if (req.method === 'POST') {
    return new MiddlewareBuilder(
      updateUserHandler,
    ).buildNonAuthenticatedMiddleware()(req, res);
  }

  return res.status(404).json({});
}
