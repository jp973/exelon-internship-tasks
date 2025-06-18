// src/models/types/userType.ts

export interface UserType {
  userName: any;
  _id: string;
  name: string;
  role?: 'admin' | 'member' | 'user'; // optional if you use it
}
