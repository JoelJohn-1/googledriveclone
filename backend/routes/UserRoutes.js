import { Router } from 'express';  
const router = Router();  
import { singup, login } from '../controllers/UserController';

// Define a route  
router.get('/signup', singup);  
  
// Define a route  
router.get('/login', login);  

// export the router module so that server.js file can use it  
export default router;