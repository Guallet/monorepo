class AuthRoutes {
  static LOGIN = "/login";
  static LOGIN_CALLBACK = "/login/callback";
  static REGISTER = "/onboarding/register";
  static WAITING_LIST = "/onboarding/waiting-list";
  static LOGOUT = "/logout";
}

class AccountRoutes {
  static ACCOUNTS = "/accounts";
  static ACCOUNT_DETAILS = (id: string) => `/accounts/${id}`;
  static ACCOUNT_DETAILS_EDIT = (id: string) => `/accounts/${id}/edit`;
  static ACCOUNT_ADD = "/accounts/add";
}

class AccountConnectionRoutes {
  static CONNECTIONS = "/connections";
  static CONNECTION_DETAILS = (id: string) => `/connections/${id}`;
  static CONNECT = "/connections/connect";
  static CONNECT_CALLBACK = "/connections/connect/callback";
}

class RulesRoutes {
  static RULES = "/categories/rules";
  static RULE_CREATE = "/categories/rules/create";
}
class CategoryRoutes {
  static CATEGORIES = "/categories";
  static Rules = RulesRoutes;
}

class UserRoutes {
  static USER_DETAILS = "/user";
  static EDIT = "/user/edit";
}

export class AppRoutes {
  static Auth = AuthRoutes;
  static User = UserRoutes;
  static Accounts = AccountRoutes;
  static Connections = AccountConnectionRoutes;
  static Categories = CategoryRoutes;
  static HOME = "/";
  static DASHBOARD = "/dashboard";
  static ABOUT = "/about";
  static CONTACT = "/contact";
  static APP_ACCOUNT_DELETED = "/delete-confirmation";
  static NOT_FOUND = "/404";
  static CATCH_ALL = "*";
  // Add more routes here
}
