import { serialize, CookieSerializeOptions } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'; 
import { PrismaClient } from '@prisma/client'


const PRIVATE_KEY = 'TODO';


export const hashPassword = (password: string) => {
  return password;
}

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (typeof options.maxAge === 'number') {
    options.expires = new Date(Date.now() + options.maxAge * 1000)
  }

  res.setHeader('Set-Cookie', serialize(name, stringValue, options))
}

export const deleteCookie = (
  res: NextApiResponse,
  name: string,
) => {
  res.setHeader('Delete-Cookie', name)
}

export class Jwt {
  static sign(userId: number) {
    const token = jwt.sign({
      userId: userId,
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
    }, PRIVATE_KEY);
    return token;
  }

  static verify(token: string) {
    const decoded = jwt.verify(token, PRIVATE_KEY);
    return decoded;
  }
}


export async function requiresAuthenticationHandler<T>(
  req: NextApiRequest,
  res: NextApiResponse<T>,
  next: any,
) {
  const prisma = new PrismaClient()
  await prisma.$connect()
  const decoded = Jwt.verify(req.cookies.token);
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) {
    // TOOD: handle error
  }

  req.user = user;

  return next(req, res);
}