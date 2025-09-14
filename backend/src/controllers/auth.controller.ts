import { NextFunction, Request, Response } from 'express';
import * as authService from '@/services/auth.service';

export async function getNonce(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) {
      return res.status(400).json({ message: 'wallet_address is required' });
    }
    const nonce = await authService.getNonce(wallet_address);
    res.status(200).json({
      success: 'success',
      nonce,
    });
  } catch (err) {
    next(err);
  }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { user, tokens } = await authService.signup(req.body);
    res.status(201).json({
      status: 'success',
      user,
      tokens,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, tokens } = await authService.login(req.body);
    res.status(200).json({
      status: 'success',
      user,
      tokens,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken } = await authService.refreshSession(
      req.refreshTokenRecord
    );
    res.status(200).json({
      status: 'success',
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { message } = await authService.logoutUser(
      req.refreshTokenRecord.token_hash
    );
    res.status(200).json({ message });
  } catch (err) {
    next(err);
  }
}
