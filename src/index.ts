import "reflect-metadata";
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express'
import {ApolloServer} from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from 'express-session';
import Redis from "ioredis";
import connectRedis from 'connect-redis'
import cors from 'cors'
import { createConnection } from 'typeorm';
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path"
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

    

    
//const corsOrigin = process.env.CORS_ORIGIN.split(',') || '';

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Updoot]
    });
    await conn.runMigrations()
    
    // await User.delete({})
    
    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL);
    app.set("trust proxy", 1);
 
    
    app.use(
        cors({
            origin: 'https://lireddit-web.vercel.app/',
            credentials: true,  
            })
        );
        
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis as any,
                disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__, // cookie only works in https
            // domain: __prod__ ? '.codeponder.com' : undefined 
            // for cookies problem with deploying on this or custom domain
            
        },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false,
        }),
    );
    // app.all('/', function(_req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //     next()
    //   });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}) => ({ 
            req, 
            res, 
            redis, 
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader() 
        })
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ 
        app, 
        cors: false
    });
    

    app.listen('https://lireddit-server-rm5nvspkx-soloq.vercel.app/')
    })
};


main().catch((err) => {
    console.error(err);
});


