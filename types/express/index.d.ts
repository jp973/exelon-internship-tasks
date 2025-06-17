// src/types/express/index.d.ts
import { ApiResponse } from '../../utils/apiResponse'; 
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      apiResponse?: ApiResponse;
      txtId?: string;
      startTime?: number;
      user?: string | JwtPayload;
    }
  }
}

