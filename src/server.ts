import App from '@/app';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import SubmitRoute from '@routes/submit.route';
import BotRoute from '@routes/bots.route';
import AuthRoute from '@routes/auth.route';
import ServerRoute from '@routes/servers.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new ServerRoute(), new SubmitRoute(), new BotRoute()]);

app.listen();
