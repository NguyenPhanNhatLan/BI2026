
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const clickhouse = createClient({
  host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
  

  username: process.env.CLICKHOUSE_USER || 'admin',
  password: process.env.CLICKHOUSE_PASSWORD || 'admin123',
  
  database: process.env.CLICKHOUSE_DB || 'default',
  
  request_timeout: 30000,
  keep_alive_max_sockets: 10,
});

export default clickhouse;