// postgresql {
import { snakeCase } from "lodash";
// } postgresql

import UserModel from "../../../models/user.model";
import UserService from "../userService";

import { UserDTO } from "../../../types";

// mongodb {
import db from "../../../testUtils/testDb";
// } mongodb
// postgresql {
import { testSql } from "../../../testUtils/testDb";
// } postgresql

const testUsers = [
  {
    firstName: "Peter",
    lastName: "Pan",
    authId: "123",
    role: "Admin",
  },
  {
    firstName: "Wendy",
    lastName: "Darling",
    authId: "321",
    role: "User",
  },
];

jest.mock("firebase-admin", () => {
  const auth = jest.fn().mockReturnValue({
    getUser: jest.fn().mockReturnValue({ email: "test@test.com" }),
  });
  return { auth };
});

// mongodb {
describe("mongo userService", (): void => {
  let userService: UserService;

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    userService = new UserService();
  });

  afterEach(async () => {
    await db.clear();
  });

  it("getUsers", async () => {
    await UserModel.insertMany(testUsers);

    const res = await userService.getUsers();

    res.forEach((user: UserDTO, i) => {
      expect(user.firstName).toEqual(testUsers[i].firstName);
      expect(user.lastName).toEqual(testUsers[i].lastName);
      expect(user.role).toEqual(testUsers[i].role);
    });
  });
});
// } mongodb

// postgresql {
describe("pg userService", () => {
  let userService: UserService;

  beforeEach(async () => {
    await testSql.sync({ force: true });
    userService = new UserService();
  });

  afterAll(async () => {
    await testSql.sync({ force: true });
    await testSql.close();
  });

  it("getUsers", async () => {
    const users = testUsers.map((user) => {
      const userSnakeCase: Record<string, string> = {};
      Object.entries(user).forEach(([key, value]) => {
        userSnakeCase[snakeCase(key)] = value;
      });
      return userSnakeCase;
    });

    await UserModel.bulkCreate(users);

    const res = await userService.getUsers();

    res.forEach((user: UserDTO, i) => {
      expect(user.firstName).toEqual(testUsers[i].firstName);
      expect(user.lastName).toEqual(testUsers[i].lastName);
      expect(user.role).toEqual(testUsers[i].role);
    });
  });
});
// } postgresql
