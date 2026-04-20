import "dotenv/config"
import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD || "PkGDr4V5NDawzB03affnZJMnTLUmb90K",
    socket: {
        host: 'redis-15496.c293.eu-central-1-1.ec2.cloud.redislabs.com',
        port: 15496
    }
});

client.on('error', err => console.log('Redis Client Error', err));
await client.connect()
export default client

