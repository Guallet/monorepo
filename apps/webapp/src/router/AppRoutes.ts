class AuthRoutes {
  static LOGIN = "/login";
  static LOGIN_CALLBACK = "/login/callback";
  static LOGOUT = "/logout";
}

class AccountRoutes {
  static ACCOUNTS = "/accounts";
  static ACCOUNT_DETAILS = (id: string) => `/accounts/${id}`;
  static ACCOUNT_DETAILS_EDIT = (id: string) => `/accounts/${id}/edit`;
  static ACCOUNT_ADD = "/accounts/add";
}

class RulesRoutes {
  static RULES = "/categories/rules";
  static RULE_CREATE = "/categories/rules/create";
}
class CategoryRoutes {
  static CATEGORIES = "/categories";
  static Rules = RulesRoutes;
}

export class AppRoutes {
  static Auth = AuthRoutes;
  static Accounts = AccountRoutes;
  static Categories = CategoryRoutes;
  static HOME = "/";
  static DASHBOARD = "/dashboard";
  static ABOUT = "/about";
  static CONTACT = "/contact";
  static NOT_FOUND = "/404";
  static CATCH_ALL = "*";
  // Add more routes here
}
