import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'lumavi',
  name: 'Lumavi',
  isDev: process.env.NODE_ENV === 'development'
});
