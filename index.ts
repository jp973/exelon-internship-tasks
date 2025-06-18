import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user/userRoutes';
import adminRoutes from './routes/admin/adminRoutes';
import { connectDB } from './models/connection';
import { seedAdminUser } from './seed/seedAdmin'; 
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './Swagger/swaggerOptions';
import memberRoutes from './routes/admin/memberRoutes';
import memberAuthRoute from './routes/admin/memberAuthRoutes';
import { Request, Response, NextFunction } from 'express';
import { initSocket } from "./socket/index";  
import http from 'http'; 
import notificationRoutes from "./routes/user/notificationRoutes";
import passport from 'passport';
import './middleware/passport';       
import notificationMemberRoute from './routes/admin/notificationMemberRoute';
import userAuthRoutes from './routes/user/userAuthRoutes';
// Import middlewares
//import passport from './middleware/passport'; // Adjust the path as per your project
const adminAuthMiddleware = passport.authenticate('bearer', { session: false });
const userAuthMiddleware = passport.authenticate('user-bearer', { session: false });

// Import routes
import groupRoutes from './routes/admin/groupRoutes';
import approveRoutes from './routes/admin/approveRoutes';
import userGroupRoutes from './routes/user/groupRoutes';

dotenv.config(); 

const app = express();
const PORT = 3000;
app.use(cors());

app.use(passport.initialize());
app.use(cookieParser());
app.use(express.json());
 
app.use('/api/users', userRoutes);  
app.use('/api/auth',userAuthRoutes );
app.use('/api/admin', adminRoutes);
app.use('/api/members', memberAuthRoute); 
app.use('/api/members', memberRoutes);
app.use("/api/notification", notificationRoutes);
app.use('/api/notifications/member', notificationMemberRoute);
app.use('/api/admin/groups', adminAuthMiddleware, groupRoutes);
app.use('/api/admin/approvals', adminAuthMiddleware, approveRoutes);
app.use('/api/user/groups', userAuthMiddleware, userGroupRoutes);
 


const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs,{
    customCss: '.swagger-ui { background:#e3f2fd; color: #263238; }',  
  }));

  
app.use((req: Request, res: Response, next: NextFunction) => {
  if ((req as any).apiResponse) {
    res.json((req as any).apiResponse);
  } else {
    next();
  }
});

const server = http.createServer(app);  
initSocket(server);  

connectDB().then(async() => {
  await seedAdminUser();  
  server.listen(PORT, () => { 
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});