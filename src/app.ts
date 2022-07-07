import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, TOKEN } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { client } from './utils/discord';
import Dokdo from 'dokdo';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.connectToDiscord();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, dbConnection.options);
  }

  private initializeMiddlewares() { 
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN.split(' '), credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private connectToDiscord() {
    client.login(TOKEN);
    client.on('ready', () => {
      logger.info(`=================================`);
      logger.info(`🚀 Discord Bot Ready ${client.user.username}#${client.user.discriminator}`);
      logger.info(`=================================`);
    });
    const dokdo: Dokdo = new Dokdo(client, {
      prefix: 'a.',
      owners: ['406815674539835402', '896570484588703744'],
      noPerm: (message) => message.reply('당신은 Dokdo 를 이용할수 없습니다.')
    })
    client.on('messageCreate', message => {
      try {
        dokdo.run(message)
      } catch(e) {
        logger.error(e)
      }
    })
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: '아카이브 API',
          version: '1.0.0',
          description: 'Archive Docs'
        },
      },
      apis: ['swagger.yaml'],
    };

    const opts: SwaggerUiOptions = {
      customfavIcon: `${ORIGIN}/favicon.ico`,
      customSiteTitle: 'API - 아카이브 ',
    }

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, opts));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
