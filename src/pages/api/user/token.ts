// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie, deleteCookie, Jwt, checkPasswordHash } from '@/lib-api/utils';
import { MiddlewareBuilder, ServerError } from '@/lib-api/utils';


type Data = any;


async function logInHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { email, password } = req.body;
  const user =  await req.prisma.user.findUnique({
    where: {
      email,
    }
  });

  if (!user || !checkPasswordHash(password, user?.passwordHash)) {
    throw new ServerError('Invalid email or password', 400);
  } else if (user) {
    const token = Jwt.sign(user.id)
    setCookie(res, 'token', token, { secure: true, httpOnly: true, sameSite: 'lax', path: '/api' });

    return res.status(200).json({});
  }

  throw new ServerError('Something went wrong - should not happen', 500);
}

function logOutHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  deleteCookie(res, 'token');
  return res.status(200).json({});
}

async function refreshTokenHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const decoded = Jwt.verify(req.cookies.token);
    console.log('[GET token] decoded', decoded)
    const user = await req.prisma.user.findUnique({
      where: {
        id: decoded.userId,
      }
    });
    console.log("[GET token] user", user)
    const token = Jwt.sign(decoded.userId)

    setCookie(res, 'token', token, { secure: true, httpOnly: true, sameSite: 'lax', path: '/api' });
    return res.status(200).json({});
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    return new MiddlewareBuilder(
      logInHandler,
    ).buildNonAuthenticatedMiddleware()(req, res);
  }

  if (req.method === 'GET') {
    return new MiddlewareBuilder(
      refreshTokenHandler,
    ).buildAuthenticatedMiddleware()(req, res);
  }

  if (req.method === 'DELETE') {
    return new MiddlewareBuilder(
      logOutHandler,
    ).buildAuthenticatedMiddleware()(req, res);
  }

  throw new ServerError('Method Not Allowed', 405)
}
