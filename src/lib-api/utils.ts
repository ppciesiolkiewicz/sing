import { serialize, CookieSerializeOptions } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'; 
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";

const PRIVATE_KEY = 'TODO';
const PASSWORD_HASH_SALT_ROUNDS = 10;


export const hashPassword = (password: string) => {
  const hash = bcrypt.hashSync(password, PASSWORD_HASH_SALT_ROUNDS);
  return hash;
}

export const checkPasswordHash = (password: string, hash: string) => {
  const result = bcrypt.compareSync(password, hash)
  return result;
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
  console.log(req.cookies)
  const prisma = new PrismaClient()
  await prisma.$connect()
  const decoded = Jwt.verify(req.cookies.token);
  console.log('requiresAuthenticationHandler.decoded', decoded);
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  console.log(user);

  if (!user) {
    throw new Error('400 - Forbidden');
  }

  req.user = user;

  return next(req, res);
}