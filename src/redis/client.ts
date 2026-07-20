import "dotenv/config"
import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-15666.c15.us-east-1-4.ec2.cloud.redislabs.com',
        port: 15666
    }
});

client.on('error', err => console.log('Redis Client Error', err));
await client.connect()
export default client

