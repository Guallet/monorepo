// This file is auto-generated by TanStack Router

import { FileRoute, lazyRouteComponent } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LogoutImport } from './routes/logout'
import { Route as LoginImport } from './routes/login'
import { Route as AppImport } from './routes/_app'
import { Route as AppUserIndexImport } from './routes/_app/user/index'
import { Route as AppTransactionsIndexImport } from './routes/_app/transactions/index'
import { Route as AppSettingsIndexImport } from './routes/_app/settings/index'
import { Route as AppReportsIndexImport } from './routes/_app/reports/index'
import { Route as AppDashboardIndexImport } from './routes/_app/dashboard/index'
import { Route as AppConnectionsIndexImport } from './routes/_app/connections/index'
import { Route as AppCategoriesIndexImport } from './routes/_app/categories/index'
import { Route as AppAccountsIndexImport } from './routes/_app/accounts/index'
import { Route as AppUserEditImport } from './routes/_app/user/edit'
import { Route as AppTransactionsInboxImport } from './routes/_app/transactions/inbox'
import { Route as AppReportsCashflowImport } from './routes/_app/reports/cashflow'
import { Route as AppConnectionsIdImport } from './routes/_app/connections/$id'
import { Route as AppAccountsAddImport } from './routes/_app/accounts/add'
import { Route as AppAccountsIdImport } from './routes/_app/accounts/$id'
import { Route as AppSettingsInstitutionsIndexImport } from './routes/_app/settings/institutions/index'
import { Route as AppConnectionsConnectIndexImport } from './routes/_app/connections/connect/index'
import { Route as AppCategoriesRulesIndexImport } from './routes/_app/categories/rules/index'
import { Route as AppConnectionsConnectCallbackImport } from './routes/_app/connections/connect/callback'
import { Route as AppCategoriesRulesCreateImport } from './routes/_app/categories/rules/create'
import { Route as AppAccountsIdEditImport } from './routes/_app/accounts/$id.edit'

// Create Virtual Routes

const UserdeletedComponentImport = new FileRoute('/userdeleted').createRoute()
const IndexComponentImport = new FileRoute('/').createRoute()
const AppToolsMortgageComponentImport = new FileRoute(
  '/_app/tools/mortgage',
).createRoute()

// Create/Update Routes

const UserdeletedComponentRoute = UserdeletedComponentImport.update({
  path: '/userdeleted',
  getParentRoute: () => rootRoute,
} as any).update({
  component: lazyRouteComponent(
    () => import('./routes/userdeleted.component'),
    'component',
  ),
})

const LogoutRoute = LogoutImport.update({
  path: '/logout',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const AppRoute = AppImport.update({
  id: '/_app',
  getParentRoute: () => rootRoute,
} as any)

const IndexComponentRoute = IndexComponentImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).update({
  component: lazyRouteComponent(
    () => import('./routes/index.component'),
    'component',
  ),
})

const AppUserIndexRoute = AppUserIndexImport.update({
  path: '/user/',
  getParentRoute: () => AppRoute,
} as any)

const AppTransactionsIndexRoute = AppTransactionsIndexImport.update({
  path: '/transactions/',
  getParentRoute: () => AppRoute,
} as any)

const AppSettingsIndexRoute = AppSettingsIndexImport.update({
  path: '/settings/',
  getParentRoute: () => AppRoute,
} as any)

const AppReportsIndexRoute = AppReportsIndexImport.update({
  path: '/reports/',
  getParentRoute: () => AppRoute,
} as any)

const AppDashboardIndexRoute = AppDashboardIndexImport.update({
  path: '/dashboard/',
  getParentRoute: () => AppRoute,
} as any)

const AppConnectionsIndexRoute = AppConnectionsIndexImport.update({
  path: '/connections/',
  getParentRoute: () => AppRoute,
} as any)

const AppCategoriesIndexRoute = AppCategoriesIndexImport.update({
  path: '/categories/',
  getParentRoute: () => AppRoute,
} as any)

const AppAccountsIndexRoute = AppAccountsIndexImport.update({
  path: '/accounts/',
  getParentRoute: () => AppRoute,
} as any)

const AppToolsMortgageComponentRoute = AppToolsMortgageComponentImport.update({
  path: '/tools/mortgage',
  getParentRoute: () => AppRoute,
} as any).update({
  component: lazyRouteComponent(
    () => import('./routes/_app/tools/mortgage.component'),
    'component',
  ),
})

const AppUserEditRoute = AppUserEditImport.update({
  path: '/user/edit',
  getParentRoute: () => AppRoute,
} as any)

const AppTransactionsInboxRoute = AppTransactionsInboxImport.update({
  path: '/transactions/inbox',
  getParentRoute: () => AppRoute,
} as any)

const AppReportsCashflowRoute = AppReportsCashflowImport.update({
  path: '/reports/cashflow',
  getParentRoute: () => AppRoute,
} as any)

const AppConnectionsIdRoute = AppConnectionsIdImport.update({
  path: '/connections/$id',
  getParentRoute: () => AppRoute,
} as any)

const AppAccountsAddRoute = AppAccountsAddImport.update({
  path: '/accounts/add',
  getParentRoute: () => AppRoute,
} as any)

const AppAccountsIdRoute = AppAccountsIdImport.update({
  path: '/accounts/$id',
  getParentRoute: () => AppRoute,
} as any)

const AppSettingsInstitutionsIndexRoute =
  AppSettingsInstitutionsIndexImport.update({
    path: '/settings/institutions/',
    getParentRoute: () => AppRoute,
  } as any)

const AppConnectionsConnectIndexRoute = AppConnectionsConnectIndexImport.update(
  {
    path: '/connections/connect/',
    getParentRoute: () => AppRoute,
  } as any,
)

const AppCategoriesRulesIndexRoute = AppCategoriesRulesIndexImport.update({
  path: '/categories/rules/',
  getParentRoute: () => AppRoute,
} as any)

const AppConnectionsConnectCallbackRoute =
  AppConnectionsConnectCallbackImport.update({
    path: '/connections/connect/callback',
    getParentRoute: () => AppRoute,
  } as any)

const AppCategoriesRulesCreateRoute = AppCategoriesRulesCreateImport.update({
  path: '/categories/rules/create',
  getParentRoute: () => AppRoute,
} as any)

const AppAccountsIdEditRoute = AppAccountsIdEditImport.update({
  path: '/edit',
  getParentRoute: () => AppAccountsIdRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexComponentImport
      parentRoute: typeof rootRoute
    }
    '/_app': {
      preLoaderRoute: typeof AppImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/logout': {
      preLoaderRoute: typeof LogoutImport
      parentRoute: typeof rootRoute
    }
    '/userdeleted': {
      preLoaderRoute: typeof UserdeletedComponentImport
      parentRoute: typeof rootRoute
    }
    '/_app/accounts/$id': {
      preLoaderRoute: typeof AppAccountsIdImport
      parentRoute: typeof AppImport
    }
    '/_app/accounts/add': {
      preLoaderRoute: typeof AppAccountsAddImport
      parentRoute: typeof AppImport
    }
    '/_app/connections/$id': {
      preLoaderRoute: typeof AppConnectionsIdImport
      parentRoute: typeof AppImport
    }
    '/_app/reports/cashflow': {
      preLoaderRoute: typeof AppReportsCashflowImport
      parentRoute: typeof AppImport
    }
    '/_app/transactions/inbox': {
      preLoaderRoute: typeof AppTransactionsInboxImport
      parentRoute: typeof AppImport
    }
    '/_app/user/edit': {
      preLoaderRoute: typeof AppUserEditImport
      parentRoute: typeof AppImport
    }
    '/_app/tools/mortgage': {
      preLoaderRoute: typeof AppToolsMortgageComponentImport
      parentRoute: typeof AppImport
    }
    '/_app/accounts/': {
      preLoaderRoute: typeof AppAccountsIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/categories/': {
      preLoaderRoute: typeof AppCategoriesIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/connections/': {
      preLoaderRoute: typeof AppConnectionsIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/dashboard/': {
      preLoaderRoute: typeof AppDashboardIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/reports/': {
      preLoaderRoute: typeof AppReportsIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/settings/': {
      preLoaderRoute: typeof AppSettingsIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/transactions/': {
      preLoaderRoute: typeof AppTransactionsIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/user/': {
      preLoaderRoute: typeof AppUserIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/accounts/$id/edit': {
      preLoaderRoute: typeof AppAccountsIdEditImport
      parentRoute: typeof AppAccountsIdImport
    }
    '/_app/categories/rules/create': {
      preLoaderRoute: typeof AppCategoriesRulesCreateImport
      parentRoute: typeof AppImport
    }
    '/_app/connections/connect/callback': {
      preLoaderRoute: typeof AppConnectionsConnectCallbackImport
      parentRoute: typeof AppImport
    }
    '/_app/categories/rules/': {
      preLoaderRoute: typeof AppCategoriesRulesIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/connections/connect/': {
      preLoaderRoute: typeof AppConnectionsConnectIndexImport
      parentRoute: typeof AppImport
    }
    '/_app/settings/institutions/': {
      preLoaderRoute: typeof AppSettingsInstitutionsIndexImport
      parentRoute: typeof AppImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexComponentRoute,
  AppRoute.addChildren([
    AppAccountsIdRoute.addChildren([AppAccountsIdEditRoute]),
    AppAccountsAddRoute,
    AppConnectionsIdRoute,
    AppReportsCashflowRoute,
    AppTransactionsInboxRoute,
    AppUserEditRoute,
    AppToolsMortgageComponentRoute,
    AppAccountsIndexRoute,
    AppCategoriesIndexRoute,
    AppConnectionsIndexRoute,
    AppDashboardIndexRoute,
    AppReportsIndexRoute,
    AppSettingsIndexRoute,
    AppTransactionsIndexRoute,
    AppUserIndexRoute,
    AppCategoriesRulesCreateRoute,
    AppConnectionsConnectCallbackRoute,
    AppCategoriesRulesIndexRoute,
    AppConnectionsConnectIndexRoute,
    AppSettingsInstitutionsIndexRoute,
  ]),
  LoginRoute,
  LogoutRoute,
  UserdeletedComponentRoute,
])
