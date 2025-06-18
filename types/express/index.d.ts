// src/types/express/index.d.ts
import { ApiResponse } from '../../utils/apiResponse'; 
import { JwtPayload } from 'jsonwebtoken';
import { UserType } from '../../models/types/userType';

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



// types/express/index.d.ts
// src/types/express/index.d.ts or project_root/types/express/index.d.ts
import { UserType } from '../../models/types/userType'; // adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
    }
  }
}
