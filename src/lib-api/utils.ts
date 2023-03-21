import { serialize, CookieSerializeOptions } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'; 
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";
import curryRight from 'lodash.curryright';
import {
  JWT_PRIVATE_KEY,
  PASSWORD_HASH_SALT_ROUNDS,
  JWT_EXPIRY_SECONDS,
} from './constants'


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
  res.setHeader('Set-Cookie', `${name}=deleted; path=/api; expires=Thu, 01 Jan 1970 00:00:00 GMT`)
}

export class Jwt {
  static sign(userId: number) {
    const token = jwt.sign({
      userId: userId,
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS!,
    }, JWT_PRIVATE_KEY!);
    return token
  }

  static verify(token: string) {
    const decoded = jwt.verify(token, JWT_PRIVATE_KEY!);
    return decoded;
  }
}

type HandlerType<T> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
) => any;

export class MiddlewareBuilder<T> {
  handler: HandlerType<T>;

  constructor(
    handler: HandlerType<T>,
  ) {
    this.handler = handler;
  }

  buildAuthenticatedMiddleware() {
    return async (
      req: NextApiRequest,
      res: NextApiResponse<T>,
    ) => {
      return curryRight(this.errorHandlerMiddleware)(
        curryRight(this.prismaMiddleware)(
          curryRight(this.requiresAuthenticationMiddleware)(
            this.handler
          )
        )
      )(req, res);
    }
  }

  buildNonAuthenticatedMiddleware() {
    return async (
      req: NextApiRequest,
      res: NextApiResponse<T>,
    ) => {
      return curryRight(this.errorHandlerMiddleware)(
        curryRight(this.prismaMiddleware)(
          this.handler
        )
      )(req, res);
    }
  }

  private async prismaMiddleware<T>(
    req: NextApiRequest,
    res: NextApiResponse<T>,
    next: any,
  ) {
    console.log('[prismaMiddleware]')
    const prisma = new PrismaClient()
    await prisma.$connect()
    req.prisma = prisma;
    return next(req, res);
  }

  private async requiresAuthenticationMiddleware<T>(
    req: NextApiRequest,
    res: NextApiResponse<T>,
    next: any,
  ) {
    let user;
    try {
      console.log('[requiresAuthenticationMiddleware]', req.cookies)
      const decoded = Jwt.verify(req.cookies.token);
      console.log('requiresAuthenticationHandler.decoded', decoded);
      user = await req.prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });
    } catch(e) {
      console.log('[requiresAuthenticationMiddleware]', e)
    }
    console.log('User:', user);
    
    if (!user) {
      return res.redirect(`http://localhost:3000`)
    }
  
    req.user = user;
  
    return next(req, res);
  }
  
  
  private async errorHandlerMiddleware(
    req: NextApiRequest,
    res: NextApiResponse<{ error: string } | T>,
    next: any,
  ) {
    console.log('[errorHandlerMiddleware]')
    try {
      return await next(req, res);
    } catch (e) {
      console.log('[ErrorHandler]', e)
      if (e instanceof ServerError) {
        return res.status(e.statusCode).json({ error: e.message });
      }
      return res.status(500).json({ error: e?.message || 'Something went wrong' });
    }
  } 
}

export class ServerError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode;
  }
}