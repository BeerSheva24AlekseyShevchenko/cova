import Router from 'express-promise-router';
import { Express, NextFunction, Request, Response } from 'express';
import { RequestHandler } from "express";

type TRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

interface IRouteItem {
  path: string;
  method: TRequestMethod;
  handler: RequestHandler;
  middlewares: RequestHandler[];
}

const ROUTES_KEY = Symbol();
const ROOT_PATH_KEY = Symbol();

export function Controller(path: string): ClassDecorator {
  return (target: any) => {
    target.prototype[ROOT_PATH_KEY] = path;
  };
}

const initRoute = (target: any, route: string | symbol): IRouteItem => {
  if (!target[ROUTES_KEY]) target[ROUTES_KEY] = new Map();
  if (!target[ROUTES_KEY].has(route)) {
    target[ROUTES_KEY].set(route, {
      path: null,
      method: null,
      handler: null,
      middlewares: [],
    });
  }
  return target[ROUTES_KEY].get(route);
};

function addRequest(method: TRequestMethod, path: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const route = initRoute(target, propertyKey);
    route.path = path;
    route.method = method;
  };
}

export const Get = (path: string) => addRequest('get', path);
export const Post = (path: string) => addRequest('post', path);
export const Put = (path: string) => addRequest('put', path);
export const Delete = (path: string) => addRequest('delete', path);
export const Patch = (path: string) => addRequest('patch', path);

function addMiddleware(value: RequestHandler | RequestHandler[]) {
  return (target: any, propertyKey: string | symbol) => {
    const route = initRoute(target, propertyKey);
    const middlewares = Array.isArray(value) ? value : [value];
    route.middlewares.unshift(...middlewares);
  };
}

export const Middleware = (fn: (request: Request) => Promise<void> | void) => {
  return addMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    await fn(req);
    next();
  });
};

export const injectControllers = (app: Express, controllers: any[]) => {
  controllers.forEach((Controller) => {
    const router = Router();
    const instance = new Controller();
    const prototype = Object.getPrototypeOf(instance);
    const rootPath = prototype[ROOT_PATH_KEY];
    const routes: Map<string, IRouteItem> = prototype[ROUTES_KEY];

    routes.forEach((params, methodName) => {
      const { path, method, middlewares } = params;
      router[method](path, ...middlewares, instance[methodName].bind(instance))
    });
    
    app.use(rootPath, router);
  });
};
