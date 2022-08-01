export class GlobalService{ 
   static sessionId: any; 
   static users: Map<string, number> = new Map(); // session id, user id
}
