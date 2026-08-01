export interface UsersListProps {
  user: {
    userId: string | number;
    firstName: string;
    lastName: string;
    roles: object;
  };
}

export type Role = {
  id: number;
  name: string;
};

export type Group = {
  id: number;
  name: string;
};

export type UserObject = {
  active: boolean;
  changed_by: string | null;
  changed_on: string;
  created_by: string | null;
  created_on: string;
  email: string;
  fail_login_count: number;
  first_name: string;
  id: number;
  last_login: string;
  last_name: string;
  login_count: number;
  roles: Role[];
  username: string;
  groups: Group[];
};
